<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

/**
 * PRD §3 — "A token minted on one client surface is rejected by the other."
 */
class SurfaceIsolationTest extends TestCase
{
    use BuildsCareCircles, RefreshDatabase;

    public function test_registration_on_the_dashboard_mints_a_dashboard_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New User',
            'email' => 'new@carecircle.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'self_user',
        ])->assertCreated();

        $token = $response->json('data.token');
        $this->assertNotNull($token);

        // The dashboard token works on its own surface…
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk();

        // …and is rejected by the mobile surface.
        $this->withToken($token)->getJson('/mobile/v1/today')->assertForbidden();
    }

    public function test_registration_on_mobile_mints_a_mobile_token_that_the_dashboard_rejects(): void
    {
        $response = $this->postJson('/mobile/v1/auth/register', [
            'name' => 'Senior User',
            'email' => 'senior-mobile@carecircle.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'senior',
        ])->assertCreated();

        $token = $response->json('data.token');

        $this->withToken($token)->getJson('/mobile/v1/today')->assertOk();
        $this->withToken($token)->getJson('/api/v1/medications')->assertForbidden();
    }

    public function test_a_mobile_token_cannot_reach_the_landlord_console(): void
    {
        $response = $this->postJson('/mobile/v1/auth/register', [
            'name' => 'Operator Wannabe',
            'email' => 'wannabe@carecircle.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'senior',
        ])->assertCreated();

        // The console route does not exist on the mobile surface at all.
        $this->withToken($response->json('data.token'))
            ->getJson('/mobile/v1/platform/system-health')
            ->assertNotFound();
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson('/api/v1/medications')->assertUnauthorized();
        $this->getJson('/mobile/v1/today')->assertUnauthorized();
    }

    /**
     * A token-only API has no `login` web route to redirect to. Without the JSON
     * negotiation middleware this answers 500 instead of 401.
     */
    public function test_unauthenticated_api_calls_answer_json_without_an_accept_header(): void
    {
        $this->get('/api/v1/medications')->assertUnauthorized();
        $this->get('/mobile/v1/today')->assertUnauthorized();
    }

    /**
     * A login belongs to an actor, not to a care circle. It must still be recorded
     * in the ledger — and must stay invisible to every tenant.
     */
    public function test_a_login_is_audited_even_though_it_belongs_to_no_care_circle(): void
    {
        $this->makeUser(['email' => 'audited@carecircle.test', 'password' => 'password']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'audited@carecircle.test',
            'password' => 'password',
        ])->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth.login',
            'care_circle_id' => null,
        ]);
    }
}
