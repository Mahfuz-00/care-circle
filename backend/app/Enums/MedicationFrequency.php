<?php

declare(strict_types=1);

namespace App\Enums;

enum MedicationFrequency: string
{
    case Daily = 'daily';
    case SpecificWeekdays = 'specific_weekdays';
    case EveryOtherDay = 'every_other_day';
    case Weekly = 'weekly';
    case AsNeeded = 'as_needed';

    public function label(): string
    {
        return match ($this) {
            self::Daily => 'Every day',
            self::SpecificWeekdays => 'Specific days',
            self::EveryOtherDay => 'Every other day',
            self::Weekly => 'Weekly',
            self::AsNeeded => 'As needed',
        };
    }

    /** Scheduled frequencies generate dose instances; as-needed does not. */
    public function isScheduled(): bool
    {
        return $this !== self::AsNeeded;
    }
}
