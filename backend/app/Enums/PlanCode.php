<?php

declare(strict_types=1);

namespace App\Enums;

enum PlanCode: string
{
    case Starter = 'starter';
    case Family = 'family';
    case CarePro = 'care_pro';
    case Enterprise = 'enterprise';

    /** PRD §8 — the initial catalogue. Caps are enforced by the API. */
    public function limits(): array
    {
        return match ($this) {
            self::Starter => ['seats' => 2, 'medications' => 5, 'voice_minutes' => 0],
            self::Family => ['seats' => 5, 'medications' => 20, 'voice_minutes' => 60],
            self::CarePro => ['seats' => 10, 'medications' => null, 'voice_minutes' => 300],
            self::Enterprise => ['seats' => null, 'medications' => null, 'voice_minutes' => null],
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Starter => 'Free / Starter',
            self::Family => 'Family',
            self::CarePro => 'Care Pro',
            self::Enterprise => 'Enterprise / Org',
        };
    }
}
