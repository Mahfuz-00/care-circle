<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\CareCircle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CareCircle */
class CareCircleResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'timezone' => $this->timezone,
            'plan_code' => $this->plan_code->value,
            'quiet_hours_start' => $this->quiet_hours_start,
            'quiet_hours_end' => $this->quiet_hours_end,
            'owner_user_id' => $this->owner_user_id,
            'member_count' => $this->whenCounted('members'),
            'medication_count' => $this->whenCounted('medications'),
        ];
    }
}
