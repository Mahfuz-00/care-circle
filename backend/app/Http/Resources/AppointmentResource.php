<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Appointment */
class AppointmentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type->value,
            'location' => $this->location,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'notes' => $this->notes,
            'shared_with_circle' => (bool) $this->shared_with_circle,
            'reminder_offsets' => $this->reminder_offsets ?? [],
            'owner' => new UserResource($this->whenLoaded('owner')),
        ];
    }
}
