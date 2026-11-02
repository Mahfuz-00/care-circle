<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BackupRun;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BackupRun */
class BackupRunResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'disk' => $this->disk,
            'size_bytes' => $this->size_bytes,
            'started_at' => $this->started_at?->toIso8601String(),
            'finished_at' => $this->finished_at?->toIso8601String(),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'message' => $this->message,
        ];
    }
}
