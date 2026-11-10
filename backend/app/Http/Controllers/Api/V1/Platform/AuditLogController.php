<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Platform Audit Ledger Controller (PRD §9).
 *
 * For platform admin, provides full operational visibility across both system/landlord
 * events and tenant/client privileged actions.
 * Cross-tenant reads deliberately use the owner connection, and every read is audited.
 */
class AuditLogController extends Controller
{
    use ReadsAcrossTenants;

    public function index(Request $request): JsonResponse
    {
        $db = $this->ownerConnection();
        $this->auditPlatformRead('platform.audit_log_viewed');

        $query = $db->table('audit_logs')
            ->leftJoin('users', 'audit_logs.actor_user_id', '=', 'users.id')
            ->leftJoin('care_circles', 'audit_logs.care_circle_id', '=', 'care_circles.id')
            ->select([
                'audit_logs.id',
                'audit_logs.care_circle_id',
                'audit_logs.actor_user_id',
                'audit_logs.actor_role',
                'audit_logs.ip_address',
                'audit_logs.level',
                'audit_logs.action',
                'audit_logs.subject_type',
                'audit_logs.subject_id',
                'audit_logs.payload',
                'audit_logs.created_at',
                'users.name as actor_name',
                'users.email as actor_email',
                'care_circles.name as care_circle_name',
            ]);

        // Filter by specific care circle if provided via param or header
        $careCircleId = $request->query('care_circle_id');
        if (! $careCircleId && $request->hasHeader('X-Care-Circle')) {
            $careCircleId = $request->header('X-Care-Circle');
        }

        if ($careCircleId && $careCircleId !== 'all') {
            $query->where('audit_logs.care_circle_id', $careCircleId);
        }

        // Filter by scope (platform vs client/household)
        if ($scope = $request->query('scope')) {
            if ($scope === 'platform' || $scope === 'landlord' || $scope === 'system') {
                $query->whereNull('audit_logs.care_circle_id');
            } elseif ($scope === 'client' || $scope === 'tenant' || $scope === 'household') {
                $query->whereNotNull('audit_logs.care_circle_id');
            }
        }

        // Filter by level
        if ($level = $request->query('level')) {
            $query->where('audit_logs.level', $level);
        }

        // Filter by action keyword
        if ($action = $request->query('action')) {
            $query->where('audit_logs.action', 'ilike', "%{$action}%");
        }

        // General search across action, actor, household name, or IP
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('audit_logs.action', 'ilike', "%{$search}%")
                    ->orWhere('users.name', 'ilike', "%{$search}%")
                    ->orWhere('users.email', 'ilike', "%{$search}%")
                    ->orWhere('care_circles.name', 'ilike', "%{$search}%")
                    ->orWhere('audit_logs.ip_address', 'ilike', "%{$search}%");
            });
        }

        $logs = $query->orderByDesc('audit_logs.created_at')
            ->limit(200)
            ->get()
            ->map(function ($row) {
                $payload = is_string($row->payload) ? json_decode($row->payload, true) : (array) ($row->payload ?? []);
                return [
                    'id' => $row->id,
                    'care_circle_id' => $row->care_circle_id,
                    'care_circle_name' => $row->care_circle_name,
                    'actor_user_id' => $row->actor_user_id,
                    'actor_role' => $row->actor_role,
                    'actor' => $row->actor_user_id ? [
                        'id' => $row->actor_user_id,
                        'name' => $row->actor_name,
                        'email' => $row->actor_email,
                    ] : null,
                    'ip_address' => $row->ip_address,
                    'level' => $row->level,
                    'action' => $row->action,
                    'subject_type' => $row->subject_type,
                    'subject_id' => $row->subject_id,
                    'payload' => $payload,
                    'created_at' => $row->created_at,
                    'scope' => $row->care_circle_id ? 'client' : 'platform',
                ];
            });

        return response()->json(['data' => $logs]);
    }
}
