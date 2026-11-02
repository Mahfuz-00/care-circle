<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\EscalationSkipReason;
use App\Services\Escalation\EscalationContext;
use App\Services\Escalation\EscalationPolicy;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

/**
 * PRD §7 — every gate, one at a time. A call is placed only when all of them pass.
 */
class EscalationPolicyTest extends TestCase
{
    private function policy(): EscalationPolicy
    {
        return new EscalationPolicy(
            maxAttemptsPerSubject: 3,
            cooldownMinutes: 30,
            dailyCallBudget: 5,
        );
    }

    /**
     * A context where every gate passes.
     */
    private function passing(array $overrides = []): EscalationContext
    {
        return new EscalationContext(...array_merge([
            'subjectType' => 'medication_dose',
            'subjectId' => 1,
            'isEmergency' => false,
            'isHighPriority' => true,
            'isOverdue' => true,
            'isStillActive' => true,
            'recipientConsents' => true,
            'recipientHasVerifiedNumber' => true,
            'withinQuietHours' => false,
            'isVoiceChannel' => true,
            'attemptsSoFar' => 0,
            'lastSentAt' => null,
            'sentTodayForCircle' => 0,
        ], $overrides));
    }

    public function test_every_gate_passing_means_a_call_is_placed(): void
    {
        $this->assertNull($this->policy()->evaluate($this->passing()));
    }

    public function test_gate_time_blocks_a_dose_that_is_not_overdue(): void
    {
        $this->assertSame(
            EscalationSkipReason::NotOverdue,
            $this->policy()->evaluate($this->passing(['isOverdue' => false])),
        );
    }

    public function test_an_emergency_bypasses_the_time_gate(): void
    {
        $this->assertNull($this->policy()->evaluate($this->passing([
            'isEmergency' => true,
            'isOverdue' => false,
        ])));
    }

    public function test_gate_priority_blocks_a_routine_medication(): void
    {
        $this->assertSame(
            EscalationSkipReason::NotHighPriority,
            $this->policy()->evaluate($this->passing(['isHighPriority' => false])),
        );
    }

    public function test_gate_consent_blocks_a_recipient_who_did_not_opt_in(): void
    {
        $this->assertSame(
            EscalationSkipReason::NoConsent,
            $this->policy()->evaluate($this->passing(['recipientConsents' => false])),
        );
    }

    public function test_gate_verified_number_blocks_an_unverified_voice_call(): void
    {
        $this->assertSame(
            EscalationSkipReason::UnverifiedNumber,
            $this->policy()->evaluate($this->passing(['recipientHasVerifiedNumber' => false])),
        );
    }

    public function test_an_unverified_number_still_allows_a_push(): void
    {
        $this->assertNull($this->policy()->evaluate($this->passing([
            'recipientHasVerifiedNumber' => false,
            'isVoiceChannel' => false,
        ])));
    }

    public function test_gate_quiet_hours_is_never_interrupted(): void
    {
        $this->assertSame(
            EscalationSkipReason::QuietHours,
            $this->policy()->evaluate($this->passing(['withinQuietHours' => true])),
        );
    }

    public function test_gate_attempt_limit_is_strict(): void
    {
        $this->assertSame(
            EscalationSkipReason::AttemptLimitReached,
            $this->policy()->evaluate($this->passing(['attemptsSoFar' => 3])),
        );
    }

    public function test_gate_cooldown_enforces_a_gap_between_attempts(): void
    {
        $this->assertSame(
            EscalationSkipReason::CooldownActive,
            $this->policy()->evaluate($this->passing(['lastSentAt' => CarbonImmutable::now()->subMinutes(5)])),
        );

        // Outside the cooldown, the gate opens again.
        $this->assertNull($this->policy()->evaluate($this->passing([
            'lastSentAt' => CarbonImmutable::now()->subMinutes(45),
        ])));
    }

    public function test_gate_budget_caps_voice_calls_per_circle_per_day(): void
    {
        $this->assertSame(
            EscalationSkipReason::BudgetExhausted,
            $this->policy()->evaluate($this->passing(['sentTodayForCircle' => 5])),
        );

        // The budget only applies to calls.
        $this->assertNull($this->policy()->evaluate($this->passing([
            'sentTodayForCircle' => 5,
            'isVoiceChannel' => false,
        ])));
    }

    public function test_gate_state_recheck_blocks_a_closed_subject(): void
    {
        $this->assertSame(
            EscalationSkipReason::SubjectNoLongerActive,
            $this->policy()->evaluate($this->passing(['isStillActive' => false])),
        );
    }

    public function test_every_skip_reason_has_a_human_readable_label(): void
    {
        foreach (EscalationSkipReason::cases() as $reason) {
            $this->assertNotSame('', trim($reason->label()), "{$reason->value} needs a label.");
        }
    }
}
