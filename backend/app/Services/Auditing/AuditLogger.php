<?php

declare(strict_types=1);

namespace App\Services\Auditing;

use App\Enums\AuditLevel;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * PRD §9 — "Every privileged action is audited in an append-only ledger
 * (actor, care_circle_id, IP, level, payload)."
 *
 * The ledger is append-only at the database level: the RLS policy grants SELECT
 * and INSERT and nothing else, so even the application cannot rewrite history.
 *
 * Rows are written with a plain INSERT rather than an Eloquent `create()`, which
 * would append `RETURNING id`. RETURNING re-reads the new row through the SELECT
 * policy — and an actor-scoped event (a login) has no care circle, so it is
 * invisible by design. We never need the row back: nothing is more append-only
 * than a value you decline to read.
 */
final class AuditLogger
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function log(
        string $action,
        ?User $actor = null,
        ?int $careCircleId = null,
        AuditLevel $level = AuditLevel::Info,
        array $payload = [],
        ?Model $subject = null,
        ?Request $request = null,
    ): void {
        $request ??= request();

        DB::table('audit_logs')->insert([
            'care_circle_id' => $careCircleId,
            'actor_user_id' => $actor?->id,
            'actor_role' => $actor?->isPlatformAdmin() ? 'platform_admin' : null,
            'ip_address' => $request?->ip(),
            'level' => $level->value,
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'payload' => json_encode($payload),
            'created_at' => now(),
        ]);
    }
}
