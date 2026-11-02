<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\MedicationDose;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin MedicationDose */
class DoseResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medication' => $this->whenLoaded('medication', fn () => [
                'id' => $this->medication->id,
                'name' => $this->medication->name,
                'dosage' => $this->medication->dosage,
            ]),
            'scheduled_for' => $this->scheduled_for?->toIso8601String(),
            'status' => $this->status->value,
            'taken_at' => $this->taken_at?->toIso8601String(),
            'marked_by' => $this->whenLoaded('markedBy', fn () => $this->markedBy === null ? null : [
                'id' => $this->markedBy->id,
                'name' => $this->markedBy->name,
            ]),
            'skip_reason' => $this->skip_reason,
            'snoozed_until' => $this->snoozed_until?->toIso8601String(),
            'snooze_count' => $this->snooze_count,
            'is_overdue' => $this->isOverdue(),
        ];
    }
}
