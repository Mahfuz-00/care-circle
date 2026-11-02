<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\EmergencyAlert;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin EmergencyAlert */
class EmergencyAlertResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'status' => $this->status->value,
            'raised_by' => $this->whenLoaded('raisedBy', fn () => [
                'id' => $this->raisedBy->id,
                'name' => $this->raisedBy->name,
            ]),
            'acknowledged_by' => $this->whenLoaded('acknowledgedBy', fn () => $this->acknowledgedBy === null ? null : [
                'id' => $this->acknowledgedBy->id,
                'name' => $this->acknowledgedBy->name,
            ]),
            'acknowledged_at' => $this->acknowledged_at?->toIso8601String(),
            'acknowledgement_seconds' => $this->acknowledgementSeconds(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'location_label' => $this->location_label,
            'note' => $this->note,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
