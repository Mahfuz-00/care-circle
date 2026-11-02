<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\CareCircleMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CareCircleMember */
class MemberResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'status' => $this->status->value,
            'permissions' => $this->permissions(),
            'receive_emergency_alerts' => (bool) $this->receive_emergency_alerts,
            'voice_consent' => (bool) $this->voice_consent,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
        ];
    }
}
