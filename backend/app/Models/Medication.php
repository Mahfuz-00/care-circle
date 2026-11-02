<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MedicationFrequency;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'care_circle_id', 'owner_user_id', 'name', 'dosage', 'form', 'instructions', 'photo_path',
    'frequency', 'times', 'days_of_week', 'with_food', 'is_high_priority',
    'stock_quantity', 'units_per_dose', 'low_stock_threshold', 'refill_reminder_days',
    'pharmacy_name', 'pharmacy_phone', 'starts_on', 'ends_on', 'is_active',
])]
class Medication extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'frequency' => MedicationFrequency::class,
            'times' => 'array',
            'days_of_week' => 'array',
            'with_food' => 'boolean',
            'is_high_priority' => 'boolean',
            'is_active' => 'boolean',
            'starts_on' => 'date',
            'ends_on' => 'date',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /** @return HasMany<MedicationDose, $this> */
    public function doses(): HasMany
    {
        return $this->hasMany(MedicationDose::class);
    }

    /** @return HasMany<StockEvent, $this> */
    public function stockEvents(): HasMany
    {
        return $this->hasMany(StockEvent::class);
    }

    /** Doses scheduled per day, derived from the configured times. */
    public function dosesPerDay(): int
    {
        $count = count($this->times ?? []);

        return max(1, $count);
    }

    /**
     * PRD §5.1 — "Automatic days remaining calculation".
     * Null when nothing is scheduled (as-needed), because there is no honest
     * number to report.
     */
    public function daysRemaining(): ?int
    {
        if (! $this->frequency->isScheduled()) {
            return null;
        }

        $perDay = $this->dosesPerDay() * max(1, $this->units_per_dose);

        return (int) floor($this->stock_quantity / $perDay);
    }

    public function isLowStock(): bool
    {
        $daysRemaining = $this->daysRemaining();

        if ($daysRemaining === null) {
            return false;
        }

        return $this->stock_quantity <= $this->low_stock_threshold
            || $daysRemaining <= $this->refill_reminder_days;
    }
}
