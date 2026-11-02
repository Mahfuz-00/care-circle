<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Medication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Medication */
class MedicationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'dosage' => $this->dosage,
            'form' => $this->form,
            'instructions' => $this->instructions,
            'photo_path' => $this->photo_path,
            'frequency' => $this->frequency->value,
            'times' => $this->times ?? [],
            'days_of_week' => $this->days_of_week ?? [],
            'with_food' => (bool) $this->with_food,
            'is_high_priority' => (bool) $this->is_high_priority,
            'stock_quantity' => $this->stock_quantity,
            'units_per_dose' => $this->units_per_dose,
            'low_stock_threshold' => $this->low_stock_threshold,
            'refill_reminder_days' => $this->refill_reminder_days,
            // Computed, never stored — PRD §5.1.
            'days_remaining' => $this->daysRemaining(),
            'is_low_stock' => $this->isLowStock(),
            'pharmacy_name' => $this->pharmacy_name,
            'pharmacy_phone' => $this->pharmacy_phone,
            'starts_on' => $this->starts_on?->toDateString(),
            'ends_on' => $this->ends_on?->toDateString(),
            'is_active' => (bool) $this->is_active,
            'owner' => new UserResource($this->whenLoaded('owner')),
        ];
    }
}
