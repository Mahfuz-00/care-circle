<?php

declare(strict_types=1);

namespace App\Services\Escalation;

use App\Enums\EscalationSkipReason;
use Carbon\CarbonImmutable;

/**
 * PRD §7 — "A voice call or caregiver notification is only placed when every gate
 * passes. Default behaviour is deliberately non-aggressive."
 *
 * Gates are evaluated in order and the first failure wins, so the recorded
 * reason is the most specific one that actually applied.
 */
final class EscalationPolicy
{
    public function __construct(
        private readonly int $maxAttemptsPerSubject,
        private readonly int $cooldownMinutes,
        private readonly int $dailyCallBudget,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            maxAttemptsPerSubject: (int) config('care-circle.escalation.max_attempts_per_subject'),
            cooldownMinutes: (int) config('care-circle.escalation.cooldown_minutes'),
            dailyCallBudget: (int) config('care-circle.escalation.daily_call_budget'),
        );
    }

    /**
     * @return EscalationSkipReason|null null when every gate passes
     */
    public function evaluate(EscalationContext $context): ?EscalationSkipReason
    {
        // 1. Time — only after the dose is overdue, or for an emergency.
        if (! $context->isEmergency && ! $context->isOverdue) {
            return EscalationSkipReason::NotOverdue;
        }

        // 2. Priority / type — high-priority medication or an emergency.
        if (! $context->isEmergency && ! $context->isHighPriority) {
            return EscalationSkipReason::NotHighPriority;
        }

        // 3. Consent — the recipient opted in.
        if (! $context->recipientConsents) {
            return EscalationSkipReason::NoConsent;
        }

        // 4. The number being called or texted must be verified.
        if ($context->isVoiceChannel && ! $context->recipientHasVerifiedNumber) {
            return EscalationSkipReason::UnverifiedNumber;
        }

        // 5. Quiet hours are never interrupted.
        if ($context->withinQuietHours) {
            return EscalationSkipReason::QuietHours;
        }

        // 6. Attempts — a strict per-item limit.
        if ($context->attemptsSoFar >= $this->maxAttemptsPerSubject) {
            return EscalationSkipReason::AttemptLimitReached;
        }

        // 7. Cooldown — a generous minimum gap between attempts.
        if ($this->inCooldown($context)) {
            return EscalationSkipReason::CooldownActive;
        }

        // 8. Budget — a daily cap per care circle.
        if ($context->isVoiceChannel && $context->sentTodayForCircle >= $this->dailyCallBudget) {
            return EscalationSkipReason::BudgetExhausted;
        }

        // 9. State re-check — the item must still be live immediately before acting.
        if (! $context->isStillActive) {
            return EscalationSkipReason::SubjectNoLongerActive;
        }

        return null;
    }

    private function inCooldown(EscalationContext $context): bool
    {
        if ($context->lastSentAt === null) {
            return false;
        }

        return $context->lastSentAt->greaterThan(
            CarbonImmutable::now()->subMinutes($this->cooldownMinutes)
        );
    }
}
