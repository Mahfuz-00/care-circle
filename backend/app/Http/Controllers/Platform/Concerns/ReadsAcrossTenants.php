<?php

declare(strict_types=1);

namespace App\Http\Controllers\Platform\Concerns;

use App\Enums\AuditLevel;
use App\Services\Auditing\AuditLogger;
use Illuminate\Support\Facades\DB;

/**
 * The landlord console is a system-level surface: it reports on the platform as
 * a whole, which is inherently cross-tenant. Tenant-scoped RLS is designed to
 * return zero rows without a care-circle context, so these operational reads
 * deliberately use the owner connection — and every read is audited.
 *
 * This connection is never used to read a tenant's clinical data for the
 * dashboard or mobile surfaces.
 */
trait ReadsAcrossTenants
{
    protected function ownerConnection()
    {
        return DB::connection('pgsql_migrations');
    }

    protected function auditPlatformRead(string $action, array $payload = []): void
    {
        app(AuditLogger::class)->log(
            action: $action,
            actor: request()->user(),
            careCircleId: null,
            level: AuditLevel::Notice,
            payload: $payload,
        );
    }
}
