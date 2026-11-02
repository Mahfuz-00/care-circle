<?php

declare(strict_types=1);

namespace App\Enums;

enum MemberStatus: string
{
    case Invited = 'invited';
    case Active = 'active';
    case Removed = 'removed';

    public function isActive(): bool
    {
        return $this === self::Active;
    }
}
