<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\DoseStatus;
use App\Models\Medication;
use App\Models\MedicationDose;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

/**
 * PRD §5.1 / §13 — one tap marks a dose, stock follows, and a completed dose
 * stops all further escalation.
 */
class DoseLifecycleTest extends TestCase
{
    use BuildsCareCircles, RefreshDatabase;

    private function medicationAndDose(array $circle, int $stock = 30): array
    {
        $medication = Medication::create([
            'care_circle_id' => $circle['circle']->id,
            'owner_user_id' => $circle['senior']->id,
            'name' => 'Metformin',
            'dosage' => '500 mg',
            'frequency' => 'daily',
            'times' => ['08:00'],
            'is_high_priority' => true,
            'stock_quantity' => $stock,
            'units_per_dose' => 1,
            'low_stock_threshold' => 5,
            'is_active' => true,
        ]);

        $dose = MedicationDose::create([
            'care_circle_id' => $circle['circle']->id,
            'medication_id' => $medication->id,
            'scheduled_for' => now()->subMinutes(30),
            'status' => DoseStatus::Pending,
        ]);

        return [$medication, $dose];
    }

    public function test_a_caregiver_marking_a_dose_taken_records_it_and_consumes_stock(): void
    {
        $circle = $this->makeCircle();
        [$medication, $dose] = $this->medicationAndDose($circle);

        Sanctum::actingAs($circle['caregiver'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/doses/{$dose->id}/take")
            ->assertOk()
            ->assertJsonPath('data.status', 'taken')
            ->assertJsonPath('data.marked_by.name', $circle['caregiver']->name);

        $this->assertSame(DoseStatus::Taken, $dose->refresh()->status);
        $this->assertSame(29, $medication->refresh()->stock_quantity);
    }

    public function test_taking_the_same_dose_twice_is_refused(): void
    {
        $circle = $this->makeCircle();
        [, $dose] = $this->medicationAndDose($circle);

        Sanctum::actingAs($circle['caregiver'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/doses/{$dose->id}/take")
            ->assertOk();

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/doses/{$dose->id}/take")
            ->assertStatus(409);
    }

    public function test_a_skipped_dose_is_recorded_with_its_reason(): void
    {
        $circle = $this->makeCircle();
        [, $dose] = $this->medicationAndDose($circle);

        Sanctum::actingAs($circle['caregiver'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/doses/{$dose->id}/skip", ['reason' => 'Felt unwell'])
            ->assertOk()
            ->assertJsonPath('data.status', 'skipped')
            ->assertJsonPath('data.skip_reason', 'Felt unwell');
    }

    public function test_a_snoozed_dose_gets_a_new_time_and_counts_the_snooze(): void
    {
        $circle = $this->makeCircle();
        [, $dose] = $this->medicationAndDose($circle);

        Sanctum::actingAs($circle['caregiver'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/doses/{$dose->id}/snooze", ['minutes' => 15])
            ->assertOk()
            ->assertJsonPath('data.status', 'snoozed')
            ->assertJsonPath('data.snooze_count', 1);

        $this->assertNotNull($dose->refresh()->snoozed_until);
    }

    public function test_todays_doses_are_listed_for_the_circle_subject(): void
    {
        $circle = $this->makeCircle();
        [, $dose] = $this->medicationAndDose($circle);

        Sanctum::actingAs($circle['primary'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->getJson('/api/v1/doses/today')
            ->assertOk()
            ->assertJsonPath('data.0.id', $dose->id);
    }

    public function test_adherence_is_measured_from_decided_doses_only(): void
    {
        $circle = $this->makeCircle();
        [$medication, $dose] = $this->medicationAndDose($circle);

        // Two more doses: one skipped, one still pending (and therefore not counted).
        MedicationDose::create([
            'care_circle_id' => $circle['circle']->id,
            'medication_id' => $medication->id,
            'scheduled_for' => now()->subHours(2),
            'status' => DoseStatus::Skipped,
        ]);

        MedicationDose::create([
            'care_circle_id' => $circle['circle']->id,
            'medication_id' => $medication->id,
            'scheduled_for' => now()->addHours(2),
            'status' => DoseStatus::Pending,
        ]);

        Sanctum::actingAs($circle['primary'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/doses/{$dose->id}/take")
            ->assertOk();

        $adherence = $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->getJson('/api/v1/adherence')
            ->assertOk()
            ->assertJsonPath('data.taken', 1)
            ->assertJsonPath('data.skipped', 1)
            ->assertJsonPath('data.total', 2);

        $this->assertSame(50.0, (float) $adherence->json('data.percentage'));
    }
}
