<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The client surface a token was minted on. PRD §3: a token minted on one
 * surface is rejected by the other.
 */
enum Surface: string
{
    case Dashboard = 'dashboard';
    case Mobile = 'mobile';

    public function ability(): string
    {
        return $this->value;
    }

    public function prefix(): string
    {
        return match ($this) {
            self::Dashboard => 'api/v1',
            self::Mobile => 'mobile/v1',
        };
    }
}
