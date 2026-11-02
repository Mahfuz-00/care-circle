<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CheckStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'status', 'message', 'meta', 'measured_at'])]
class SystemCheck extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CheckStatus::class,
            'meta' => 'array',
            'measured_at' => 'datetime',
        ];
    }
}
