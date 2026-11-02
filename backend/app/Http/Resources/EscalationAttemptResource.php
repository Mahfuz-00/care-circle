<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\EscalationAttempt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin EscalationAttempt */
class EscalationAttemptResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel->value,
            'status' => $this->status->value,
            'reason' => $this->reason,
            'detail' => $this->detail,
            'target_user_id' => $this->target_user_id,
            'attempted_at' => $this->attempted_at?->toIso8601String(),
        ];
    }
}
