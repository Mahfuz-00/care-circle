<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PlanCode;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * PRD §8 — the plan catalogue. Values come from PlanCode so the enum stays
     * the single source of truth.
     */
    public function run(): void
    {
        foreach (PlanCode::cases() as $plan) {
            $limits = $plan->limits();

            Plan::updateOrCreate(
                ['code' => $plan->value],
                [
                    'name' => $plan->label(),
                    'seats' => $limits['seats'],
                    'medications' => $limits['medications'],
                    'voice_minutes' => $limits['voice_minutes'],
                ],
            );
        }
    }
}
