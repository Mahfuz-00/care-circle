<?php

declare(strict_types=1);

namespace App\Enums;

enum DoseStatus: string
{
    case Pending = 'pending';
    case Snoozed = 'snoozed';
    case Taken = 'taken';
    case Skipped = 'skipped';
    case Missed = 'missed';

    /** A dose that has reached a terminal state stops all further escalation. */
    public function isClosed(): bool
    {
        return $this === self::Taken || $this === self::Skipped;
    }

    /** Closed doses are the denominator of adherence. */
    public function countsTowardsAdherence(): bool
    {
        return $this === self::Taken || $this === self::Skipped || $this === self::Missed;
    }
}
