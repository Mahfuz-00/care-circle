<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Medication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

/**
 * PRD §6 — the role matrix, enforced by the API. A missing permission is a 403,
 * not a hidden button.
 */
class CareCirclePermissionsTest extends TestCase
{
    use BuildsCareCircles, RefreshDatabase;

    private function seniorMedication(array $circle): Medication
    {
        return Medication::create([
            'care_circle_id' => $circle['circle']->id,
            'owner_user_id' => $circle['senior']->id,
            'name' => 'Metformin',
            'dosage' => '500 mg',
            'frequency' => 'daily',
            'times' => ['08:00'],
            'stock_quantity' => 30,
            'is_active' => true,
        ]);
    }

    public function test_a_caregiver_cannot_edit_another_members_medication(): void
    {
        $circle = $this->makeCircle();
        $medication = $this->seniorMedication($circle);

        Sanctum::actingAs($circle['caregiver'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->patchJson("/api/v1/medications/{$medication->id}", ['dosage' => '1000 mg'])
            ->assertForbidden();
    }

    public function test_a_primary_caregiver_can_edit_another_members_medication(): void
    {
        $circle = $this->makeCircle();
        $medication = $this->seniorMedication($circle);

        Sanctum::actingAs($circle['primary'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->patchJson("/api/v1/medications/{$medication->id}", ['dosage' => '1000 mg'])
            ->assertOk()
            ->assertJsonPath('data.dosage', '1000 mg');
    }

    public function test_a_senior_can_always_add_their_own_medication(): void
    {
        $circle = $this->makeCircle();

        Sanctum::actingAs($circle['senior'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson('/api/v1/medications', [
                'name' => 'Vitamin D',
                'dosage' => '1000 IU',
                'frequency' => 'daily',
                'times' => ['09:00'],
                'stock_quantity' => 90,
            ])
            ->assertCreated()
            ->assertJsonPath('data.owner.id', $circle['senior']->id);
    }

    public function test_a_caregiver_cannot_manage_the_care_circle(): void
    {
        $circle = $this->makeCircle();

        Sanctum::actingAs($circle['caregiver'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/care-circles/{$circle['circle']->id}/invitations", [
                'email' => 'newcomer@carecircle.test',
                'role' => 'caregiver',
            ])
            ->assertForbidden();
    }

    public function test_a_primary_caregiver_can_invite_a_member(): void
    {
        $circle = $this->makeCircle();

        Sanctum::actingAs($circle['primary'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->postJson("/api/v1/care-circles/{$circle['circle']->id}/invitations", [
                'email' => 'newcomer@carecircle.test',
                'role' => 'caregiver',
            ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'newcomer@carecircle.test');
    }

    public function test_an_outsider_cannot_select_a_care_circle_they_do_not_belong_to(): void
    {
        $circle = $this->makeCircle();
        $outsider = $this->makeUser(['name' => 'Outsider']);

        Sanctum::actingAs($outsider, ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->getJson('/api/v1/medications')
            ->assertForbidden();
    }

    public function test_a_senior_can_see_who_has_access(): void
    {
        $circle = $this->makeCircle();

        Sanctum::actingAs($circle['senior'], ['dashboard']);

        $this->withHeader('X-Care-Circle', (string) $circle['circle']->id)
            ->getJson("/api/v1/care-circles/{$circle['circle']->id}/members")
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /**
     * Note: assertions about *which rows exist* under isolation are not meaningful
     * here. This suite runs on the migration owner connection, which bypasses RLS;
     * `TenantIsolationTest` makes those assertions on the runtime role.
     */
    public function test_the_session_endpoint_answers_with_the_circle_shape(): void
    {
        $circle = $this->makeCircle();

        Sanctum::actingAs($circle['primary'], ['dashboard']);

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonStructure(['data' => ['user', 'care_circles', 'active_care_circle']]);
    }
}
