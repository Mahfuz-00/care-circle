<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\SystemCheck;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SystemCheck */
class SystemCheckResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'status' => $this->status->value,
            'message' => $this->message,
            'meta' => $this->meta ?? [],
            'measured_at' => $this->measured_at?->toIso8601String(),
        ];
    }
}
