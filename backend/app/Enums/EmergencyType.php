<?php

declare(strict_types=1);

namespace App\Enums;

enum EmergencyType: string
{
    case Medical = 'medical';
    case Fall = 'fall';
    case HeartAttack = 'heart_attack';
    case SevereSymptoms = 'severe_symptoms';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Medical => 'Medical emergency',
            self::Fall => 'Fall',
            self::HeartAttack => 'Possible heart attack',
            self::SevereSymptoms => 'Severe symptoms',
            self::Other => 'Something else',
        };
    }
}
