<?php

declare(strict_types=1);

namespace App\Services\Scheduling;

use App\Enums\DoseStatus;
use App\Enums\MedicationFrequency;
use App\Models\Medication;
use App\Models\MedicationDose;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Turns a medication's schedule into concrete dose instances. Idempotent: the
 * unique index on (medication_id, scheduled_for) means running it twice for the
 * same day is a no-op.
 */
final class DoseScheduler
{
    public function isDueOn(Medication $medication, CarbonInterface $date): bool
    {
        if (! $medication->is_active || ! $medication->frequency->isScheduled()) {
            return false;
        }

        if ($medication->starts_on && $date->lt($medication->starts_on)) {
            return false;
        }

        if ($medication->ends_on && $date->gt($medication->ends_on)) {
            return false;
        }

        return match ($medication->frequency) {
            MedicationFrequency::Daily => true,
            MedicationFrequency::Weekly => true,
            MedicationFrequency::SpecificWeekdays => in_array(
                (int) $date->dayOfWeek,
                array_map('intval', $medication->days_of_week ?? []),
                true,
            ),
            MedicationFrequency::EveryOtherDay => $medication->starts_on !== null
                && ((int) $medication->starts_on->diffInDays($date) % 2) === 0,
            MedicationFrequency::AsNeeded => false,
        };
    }

    /**
     * @return int the number of doses created
     */
    public function generateForMedication(Medication $medication, CarbonInterface $date): int
    {
        if (! $this->isDueOn($medication, $date)) {
            return 0;
        }

        $created = 0;

        foreach ($medication->times ?? [] as $time) {
            $scheduledFor = CarbonImmutable::parse($date->toDateString().' '.$time, $medication->careCircle?->timezone ?? 'UTC');

            $exists = MedicationDose::query()
                ->where('medication_id', $medication->id)
                ->where('scheduled_for', $scheduledFor)
                ->exists();

            if ($exists) {
                continue;
            }

            MedicationDose::create([
                'care_circle_id' => $medication->care_circle_id,
                'medication_id' => $medication->id,
                'scheduled_for' => $scheduledFor,
                'status' => DoseStatus::Pending,
            ]);

            $created++;
        }

        return $created;
    }
}
