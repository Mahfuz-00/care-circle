<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\PlanCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PRD §8 — the plan catalogue is what the marketing page shows, so it must come
 * from the same place the API enforces limits from.
 */
class PlanCatalogueTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_catalogue_is_public(): void
    {
        // No token: this is the pricing on the public marketing page.
        $this->getJson('/api/v1/plans')->assertOk();
    }

    public function test_it_returns_every_plan_in_catalogue_order(): void
    {
        $codes = array_column($this->getJson('/api/v1/plans')->json('data'), 'code');

        $this->assertSame(
            array_map(static fn (PlanCode $plan): string => $plan->value, PlanCode::cases()),
            $codes,
        );
    }

    public function test_the_limits_match_the_source_of_truth(): void
    {
        $plans = collect($this->getJson('/api/v1/plans')->json('data'));
        $starter = $plans->firstWhere('code', PlanCode::Starter->value);
        $carePro = $plans->firstWhere('code', PlanCode::CarePro->value);

        // Starter: 2 seats, 5 medications, push only.
        $this->assertSame(2, $starter['seats']);
        $this->assertSame(5, $starter['medications']);
        $this->assertSame(0, $starter['voice_minutes']);

        // Care Pro is uncapped on medications — reported as null, never as zero.
        $this->assertSame(10, $carePro['seats']);
        $this->assertNull($carePro['medications']);
        $this->assertSame(300, $carePro['voice_minutes']);
    }

    public function test_the_catalogue_does_not_leak_tenant_data(): void
    {
        $payload = $this->getJson('/api/v1/plans')->json('data');

        foreach ($payload as $plan) {
            $this->assertSame(
                ['code', 'name', 'seats', 'medications', 'voice_minutes', 'notes'],
                array_keys($plan),
            );
        }
    }
}
