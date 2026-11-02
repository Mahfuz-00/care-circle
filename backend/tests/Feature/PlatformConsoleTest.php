<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

/**
 * PRD §3 / §10 — the landlord console is operator-only and reports only what it
 * measured.
 */
class PlatformConsoleTest extends TestCase
{
    use BuildsCareCircles, RefreshDatabase;

    private function operator(): User
    {
        return $this->makeUser([
            'name' => 'Operator',
            'is_platform_admin' => true,
        ]);
    }

    public function test_a_normal_caregiver_cannot_reach_the_console(): void
    {
        $circle = $this->makeCircle();

        Sanctum::actingAs($circle['primary'], ['dashboard']);

        $this->getJson('/api/v1/platform/system-health')->assertForbidden();
        $this->getJson('/api/v1/platform/metrics')->assertForbidden();
    }

    public function test_the_dashboard_ability_alone_is_not_enough_for_the_console(): void
    {
        $operator = $this->operator();

        // The right user, but a token without the platform.admin ability.
        Sanctum::actingAs($operator, ['dashboard']);

        $this->getJson('/api/v1/platform/system-health')->assertForbidden();
    }

    public function test_an_operator_with_both_the_ability_and_the_flag_gets_in(): void
    {
        Sanctum::actingAs($this->operator(), ['dashboard', 'platform.admin']);

        $this->getJson('/api/v1/platform/system-health')
            ->assertOk()
            ->assertJsonStructure(['data' => [['key', 'status', 'message', 'measured_at']]]);
    }

    public function test_health_checks_never_claim_more_than_they_measured(): void
    {
        Sanctum::actingAs($this->operator(), ['dashboard', 'platform.admin']);

        $checks = $this->getJson('/api/v1/platform/system-health')->json('data');

        $allowed = ['ok', 'warn', 'fail', 'skipped'];

        $this->assertNotEmpty($checks);

        foreach ($checks as $check) {
            $this->assertContains($check['status'], $allowed, "{$check['key']} reported an impossible status.");
            $this->assertNotSame('', trim((string) $check['message']), "{$check['key']} must say why.");
        }

        // The scheduler has never run in this test, so it must NOT be reported ok.
        $scheduler = collect($checks)->firstWhere('key', 'scheduler');
        $this->assertNotSame('ok', $scheduler['status']);
    }

    public function test_metrics_report_null_rather_than_zero_when_nothing_was_measured(): void
    {
        Sanctum::actingAs($this->operator(), ['dashboard', 'platform.admin']);

        $this->getJson('/api/v1/platform/metrics')
            ->assertOk()
            ->assertJsonPath('data.adherence_percentage', null)
            ->assertJsonPath('data.emergency_ack_seconds', null);
    }

    public function test_the_audit_ledger_requires_a_circle_context_and_fails_closed_without_one(): void
    {
        $operator = $this->operator();
        Sanctum::actingAs($operator, ['dashboard', 'platform.admin']);

        $circle = $this->makeCircle();

        // An operator is not a member of the circle, and with no context set the
        // ledger returns nothing rather than everything.
        $this->withHeader('X-Care-Circle', '')
            ->getJson('/api/v1/platform/audit-log')
            ->assertOk()
            ->assertJsonPath('data', []);
    }
}
