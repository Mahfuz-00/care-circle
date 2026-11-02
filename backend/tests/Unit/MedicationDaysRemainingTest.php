<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\MedicationFrequency;
use App\Models\Medication;
use PHPUnit\Framework\TestCase;

class MedicationDaysRemainingTest extends TestCase
{
    private function medication(array $attributes): Medication
    {
        $medication = new Medication;
        $medication->forceFill(array_merge([
            'frequency' => MedicationFrequency::Daily,
            'times' => ['08:00'],
            'units_per_dose' => 1,
            'stock_quantity' => 30,
            'low_stock_threshold' => 5,
            'refill_reminder_days' => 7,
        ], $attributes));

        return $medication;
    }

    public function test_days_remaining_accounts_for_doses_per_day_and_units_per_dose(): void
    {
        // 60 tablets, one tablet twice a day → 30 days.
        $medication = $this->medication([
            'times' => ['08:00', '20:00'],
            'stock_quantity' => 60,
        ]);

        $this->assertSame(30, $medication->daysRemaining());
    }

    public function test_days_remaining_divides_by_units_per_dose(): void
    {
        // 30 tablets, two tablets once a day → 15 days.
        $medication = $this->medication([
            'stock_quantity' => 30,
            'units_per_dose' => 2,
        ]);

        $this->assertSame(15, $medication->daysRemaining());
    }

    public function test_as_needed_medication_reports_no_days_remaining(): void
    {
        // There is no honest number to report for an as-needed medication.
        $medication = $this->medication(['frequency' => MedicationFrequency::AsNeeded]);

        $this->assertNull($medication->daysRemaining());
        $this->assertFalse($medication->isLowStock());
    }

    public function test_low_stock_is_true_when_the_threshold_is_reached(): void
    {
        $medication = $this->medication(['stock_quantity' => 5, 'low_stock_threshold' => 5]);

        $this->assertTrue($medication->isLowStock());
    }

    public function test_low_stock_is_true_when_days_remaining_is_inside_the_reminder_window(): void
    {
        // 10 tablets, one a day → 10 days; threshold is low but the refill window is 14 days.
        $medication = $this->medication([
            'stock_quantity' => 10,
            'low_stock_threshold' => 2,
            'refill_reminder_days' => 14,
        ]);

        $this->assertTrue($medication->isLowStock());
    }

    public function test_a_well_stocked_medication_is_not_low(): void
    {
        $medication = $this->medication(['stock_quantity' => 90, 'low_stock_threshold' => 10]);

        $this->assertFalse($medication->isLowStock());
    }
}
