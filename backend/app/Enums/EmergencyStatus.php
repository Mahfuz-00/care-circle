<?php

declare(strict_types=1);

namespace App\Enums;

enum EmergencyStatus: string
{
    case Open = 'open';
    case Acknowledged = 'acknowledged';
    case Resolved = 'resolved';
    case Cancelled = 'cancelled';

    public function isOpen(): bool
    {
        return $this === self::Open || $this === self::Acknowledged;
    }
}
