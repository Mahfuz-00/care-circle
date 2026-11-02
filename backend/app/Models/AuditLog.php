<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AuditLevel;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Append-only. PRD §9: actor, care-circle, IP, level, payload.
 * The database enforces append-only — there is no UPDATE or DELETE policy.
 */
#[Fillable([
    'care_circle_id', 'actor_user_id', 'actor_role', 'ip_address', 'level',
    'action', 'subject_type', 'subject_id', 'payload', 'created_at',
])]
class AuditLog extends Model
{
    use BelongsToCareCircle;

    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => AuditLevel::class,
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
