<?php

declare(strict_types=1);

namespace App\Enums;

enum AppointmentType: string
{
    case Doctor = 'doctor';
    case Lab = 'lab';
    case Procedure = 'procedure';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Doctor => 'Doctor',
            self::Lab => 'Lab',
            self::Procedure => 'Procedure',
            self::Other => 'Other',
        };
    }
}
