<?php

declare(strict_types=1);

namespace App\Services\Escalation;

use App\Enums\DoseStatus;
use App\Enums\EscalationChannel;
use App\Enums\EscalationSkipReason;
use App\Enums\EscalationStatus;
use App\Enums\MemberStatus;
use App\Models\CareCircle;
use App\Models\CareCircleMember;
use App\Models\EmergencyAlert;
use App\Models\EscalationAttempt;
use App\Models\MedicationDose;
use App\Services\Channels\ChannelManager;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Runs one escalation pass for a subject and records the outcome of every
 * candidate — including the ones it deliberately skipped, and why.
 */
final class EscalationEngine
{
    public function __construct(
        private readonly EscalationPolicy $policy,
        private readonly ChannelManager $channels,
    ) {}

    /**
     * @return list<EscalationAttempt>
     */
    public function attempt(Model $subject, EscalationChannel $channel): array
    {
        $careCircleId = (int) $subject->care_circle_id;
        $careCircle = CareCircle::findOrFail($careCircleId);

        $recipients = $this->recipients($careCircleId, $subject);

        if ($recipients->isEmpty()) {
            return [$this->record($subject, $channel, null, EscalationSkipReason::NoReachableRecipient)];
        }

        $attempts = [];

        foreach ($recipients as $member) {
            $reason = $this->policy->evaluate($this->context($subject, $member, $careCircle, $channel));

            if ($reason !== null) {
                // A skipped call is information, not a failure.
                $attempts[] = $this->record($subject, $channel, $member->user_id, $reason);

                continue;
            }

            $result = $this->channels->for($channel)->send(
                careCircleId: $careCircleId,
                targetUserId: $member->user_id,
                address: $channel === EscalationChannel::Voice ? $member->user?->phone : $member->user?->email,
                template: $this->template($subject),
                payload: $this->payload($subject),
            );

            $attempts[] = $this->record($subject, $channel, $member->user_id, null, $result->status, $result->providerMessageId, $result->error);

            // One reached caregiver is enough for this pass.
            break;
        }

        return $attempts;
    }

    private function context(
        Model $subject,
        CareCircleMember $member,
        CareCircle $careCircle,
        EscalationChannel $channel,
    ): EscalationContext {
        $isEmergency = $subject instanceof EmergencyAlert;
        $now = CarbonImmutable::now($careCircle->timezone);

        return new EscalationContext(
            subjectType: $subject->getMorphClass(),
            subjectId: (int) $subject->getKey(),
            isEmergency: $isEmergency,
            isHighPriority: $isEmergency || (bool) ($subject->medication?->is_high_priority ?? false),
            // "Overdue" is about the clock, not the status: a dose whose time has
            // passed is overdue whether or not somebody has since acted on it.
            isOverdue: $subject instanceof MedicationDose ? $subject->scheduled_for->isPast() : true,
            isStillActive: $this->isStillActive($subject),
            recipientConsents: (bool) $member->receive_emergency_alerts
                && ($channel !== EscalationChannel::Voice || (bool) $member->voice_consent || $isEmergency),
            recipientHasVerifiedNumber: $member->user?->phone_verified_at !== null,
            withinQuietHours: $this->withinQuietHours($careCircle, $now),
            isVoiceChannel: $channel === EscalationChannel::Voice,
            attemptsSoFar: $this->attemptsFor($subject),
            lastSentAt: $this->lastSentAt($subject),
            sentTodayForCircle: $this->sentToday($careCircle),
        );
    }

    private function isStillActive(Model $subject): bool
    {
        return match (true) {
            $subject instanceof MedicationDose => $subject->status === DoseStatus::Pending
                || $subject->status === DoseStatus::Snoozed,
            $subject instanceof EmergencyAlert => $subject->status->isOpen(),
            default => true,
        };
    }

    private function withinQuietHours(CareCircle $careCircle, CarbonImmutable $now): bool
    {
        if ($careCircle->quiet_hours_start === null || $careCircle->quiet_hours_end === null) {
            return false;
        }

        $start = $now->copy()->setTimeFromTimeString((string) $careCircle->quiet_hours_start);
        $end = $now->copy()->setTimeFromTimeString((string) $careCircle->quiet_hours_end);

        // A window that crosses midnight, e.g. 21:00 → 07:00.
        if ($start->greaterThan($end)) {
            return $now->greaterThanOrEqualTo($start) || $now->lessThanOrEqualTo($end);
        }

        return $now->betweenIncluded($start, $end);
    }

    /** @return Collection<int, CareCircleMember> */
    private function recipients(int $careCircleId, Model $subject): Collection
    {
        // The person the escalation is *about* is never a recipient of it.
        $subjectUserId = match (true) {
            $subject instanceof EmergencyAlert => $subject->raised_by_user_id,
            $subject instanceof MedicationDose => $subject->medication?->owner_user_id,
            default => null,
        };

        // Consent is deliberately NOT filtered here — EscalationPolicy decides it,
        // so a non-consenting caregiver produces a `no_consent` record rather than
        // silently disappearing from the candidate list.
        return CareCircleMember::query()
            ->with('user')
            ->where('care_circle_id', $careCircleId)
            ->where('status', MemberStatus::Active->value)
            ->when($subjectUserId !== null, fn ($query) => $query->where('user_id', '!=', $subjectUserId))
            ->orderByRaw("role = 'primary_caregiver' desc")
            ->get();
    }

    private function attemptsFor(Model $subject): int
    {
        return EscalationAttempt::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->where('status', EscalationStatus::Sent->value)
            ->count();
    }

    private function lastSentAt(Model $subject): ?CarbonImmutable
    {
        $attempt = EscalationAttempt::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->where('status', EscalationStatus::Sent->value)
            ->latest('attempted_at')
            ->first();

        return $attempt?->attempted_at?->toImmutable();
    }

    private function sentToday(CareCircle $careCircle): int
    {
        return EscalationAttempt::query()
            ->where('care_circle_id', $careCircle->id)
            ->where('channel', EscalationChannel::Voice->value)
            ->where('status', EscalationStatus::Sent->value)
            ->whereDate('attempted_at', CarbonImmutable::now($careCircle->timezone)->toDateString())
            ->count();
    }

    private function record(
        Model $subject,
        EscalationChannel $channel,
        ?int $targetUserId,
        ?EscalationSkipReason $reason,
        EscalationStatus $status = EscalationStatus::Skipped,
        ?string $providerMessageId = null,
        ?string $error = null,
    ): EscalationAttempt {
        return EscalationAttempt::create([
            'care_circle_id' => (int) $subject->care_circle_id,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => (int) $subject->getKey(),
            'channel' => $channel,
            'status' => $status,
            'reason' => $reason?->value,
            'target_user_id' => $targetUserId,
            'provider_message_id' => $providerMessageId,
            'detail' => $reason?->label() ?? $error,
            'attempted_at' => now(),
        ]);
    }

    private function template(Model $subject): string
    {
        return match (true) {
            $subject instanceof EmergencyAlert => 'emergency.raised',
            $subject instanceof MedicationDose => 'dose.reminder',
            default => 'generic',
        };
    }

    /** @return array<string, mixed> */
    private function payload(Model $subject): array
    {
        return match (true) {
            $subject instanceof EmergencyAlert => [
                'alert_id' => $subject->id,
                'type' => $subject->type->value,
                'location' => $subject->location_label,
            ],
            $subject instanceof MedicationDose => [
                'dose_id' => $subject->id,
                'medication' => $subject->medication?->name,
                'scheduled_for' => $subject->scheduled_for?->toIso8601String(),
            ],
            default => [],
        };
    }
}
