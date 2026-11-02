<?php

declare(strict_types=1);

namespace App\Enums;

enum EscalationStatus: string
{
    case Sent = 'sent';
    case Skipped = 'skipped';
    case Failed = 'failed';
    case Acknowledged = 'acknowledged';
}
