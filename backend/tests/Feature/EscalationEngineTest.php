<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\EscalationChannel;
use App\Enums\EscalationStatus;
use App\Models\EscalationAttempt;
use App\Models\Medication;
use App\Models\MedicationDose;
use App\Services\Escalation\EscalationEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

/**
 * PRD §7 — the engine places a call only when every gate passes, and records
 * the reason whenever it does not.
 */
class EscalationEngineTest extends TestCase
{
    use BuildsCareCircles, RefreshDatabase;

    private function overdueDose(array $circle, bool $highPriority = true): MedicationDose
    {
        $medication = Medication::create([
            'care_circle_id' => $circle['circle']->id,
            'owner_user_id' => $circle['senior']->id,
            'name' => 'Metformin',
            'dosage' => '500 mg',
            'frequency' => 'daily',
            'times' => ['08:00'],
            'is_high_priority' => $highPriority,
            'stock_quantity' => 30,
            'is_active' => true,
        ]);

        return MedicationDose::create([
            'care_circle_id' => $circle['circle']->id,
            'medication_id' => $medication->id,
            'scheduled_for' => now()->subHour(),
            'status' => 'pending',
        ]);
    }

    private function engine(): EscalationEngine
    {
        return app(EscalationEngine::class);
    }

    public function test_an_overdue_high_priority_dose_reaches_a_caregiver(): void
    {
        $circle = $this->makeCircle();
        $dose = $this->overdueDose($circle);

        $attempts = $this->engine()->attempt($dose, EscalationChannel::Push);

        $this->assertNotEmpty($attempts);
        $this->assertSame(EscalationStatus::Sent, $attempts[0]->status);
        $this->assertSame($circle['primary']->id, $attempts[0]->target_user_id);

        // The attempt is on the record.
        $this->assertSame(1, EscalationAttempt::where('status', 'sent')->count());
    }

    public function test_a_routine_medication_is_skipped_with_the_reason_recorded(): void
    {
        $circle = $this->makeCircle();
        $dose = $this->overdueDose($circle, highPriority: false);

        $attempts = $this->engine()->attempt($dose, EscalationChannel::Push);

        $this->assertSame('not_high_priority', $attempts[0]->reason);
        $this->assertSame(EscalationStatus::Skipped, $attempts[0]->status);
    }

    public function test_quiet_hours_are_never_interrupted_even_for_a_priority_dose(): void
    {
        $circle = $this->makeCircle(circleAttributes: [
            'quiet_hours_start' => now()->subHour()->format('H:i'),
            'quiet_hours_end' => now()->addHour()->format('H:i'),
        ]);
        $dose = $this->overdueDose($circle);

        $attempts = $this->engine()->attempt($dose, EscalationChannel::Push);

        $this->assertSame('quiet_hours', $attempts[0]->reason);
    }

    public function test_a_caregiver_who_did_not_opt_in_is_skipped_with_consent_reason(): void
    {
        $circle = $this->makeCircle();
        $dose = $this->overdueDose($circle);

        // Nobody in the circle wants emergency alerts.
        $circle['circle']->members()->update(['receive_emergency_alerts' => false]);

        $attempts = $this->engine()->attempt($dose, EscalationChannel::Push);

        $this->assertSame('no_consent', $attempts[0]->reason);
    }

    public function test_push_does_not_require_a_verified_number_but_voice_does(): void
    {
        $circle = $this->makeCircle();
        $dose = $this->overdueDose($circle);

        // Nobody has a verified number.
        $circle['primary']->forceFill(['phone_verified_at' => null])->save();
        $circle['caregiver']->forceFill(['phone_verified_at' => null])->save();

        $push = $this->engine()->attempt($dose, EscalationChannel::Push);
        $this->assertSame(EscalationStatus::Sent, $push[0]->status);

        $voice = $this->engine()->attempt($dose->refresh(), EscalationChannel::Voice);
        $this->assertSame('unverified_number', $voice[0]->reason);
    }

    public function test_a_closed_dose_is_never_escalated(): void
    {
        $circle = $this->makeCircle();
        $dose = $this->overdueDose($circle);
        $dose->update(['status' => 'taken', 'taken_at' => now()]);

        $attempts = $this->engine()->attempt($dose->refresh(), EscalationChannel::Push);

        $this->assertSame('subject_no_longer_active', $attempts[0]->reason);
    }

    public function test_an_all_clear_pass_happens_once_then_the_cooldown_holds(): void
    {
        $circle = $this->makeCircle();
        $dose = $this->overdueDose($circle);

        $first = $this->engine()->attempt($dose, EscalationChannel::Push);
        $this->assertSame(EscalationStatus::Sent, $first[0]->status);

        // Immediately repeating must not call again.
        $second = $this->engine()->attempt($dose->refresh(), EscalationChannel::Push);
        $this->assertSame('cooldown_active', $second[0]->reason);
    }
}
