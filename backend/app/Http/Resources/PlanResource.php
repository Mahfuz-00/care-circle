<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Plan */
class PlanResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code,
            'name' => $this->name,
            // Null means "not capped on this plan" — the UI must say that rather
            // than print a zero.
            'seats' => $this->seats,
            'medications' => $this->medications,
            'voice_minutes' => $this->voice_minutes,
            'notes' => $this->notes,
        ];
    }
}
