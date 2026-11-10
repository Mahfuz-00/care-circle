<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Landlord platform clients (households) module controller.
 * Reads cross-tenant care circles safely and audited.
 */
class ClientController extends Controller
{
    use ReadsAcrossTenants;

    public function index(Request $request): JsonResponse
    {
        $db = $this->ownerConnection();
        $this->auditPlatformRead('platform.clients_viewed');

        $query = $db->table('care_circles')
            ->join('users', 'care_circles.owner_user_id', '=', 'users.id')
            ->leftJoin('plans', 'care_circles.plan_code', '=', 'plans.code')
            ->select([
                'care_circles.id',
                'care_circles.name',
                'care_circles.plan_code',
                'care_circles.timezone',
                'care_circles.status',
                'care_circles.created_at',
                'users.id as owner_id',
                'users.name as owner_name',
                'users.email as owner_email',
                'plans.name as plan_name',
            ]);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('care_circles.name', 'ilike', "%{$search}%")
                    ->orWhere('users.name', 'ilike', "%{$search}%")
                    ->orWhere('users.email', 'ilike', "%{$search}%");
            });
        }

        if ($plan = $request->query('plan')) {
            $query->where('care_circles.plan_code', $plan);
        }

        $clients = $query->orderByDesc('care_circles.created_at')->get();

        $mrrMap = [
            'starter' => 19,
            'family' => 39,
            'concierge' => 79,
            'essential' => 19,
            'comprehensive' => 39,
        ];

        $enriched = $clients->map(function ($client) use ($db, $mrrMap) {
            $memberCount = $db->table('care_circle_members')
                ->where('care_circle_id', $client->id)
                ->where('status', 'active')
                ->count();

            $medicationCount = $db->table('medications')
                ->where('care_circle_id', $client->id)
                ->count();

            $activeAlertsCount = $db->table('emergency_alerts')
                ->where('care_circle_id', $client->id)
                ->where('status', 'open')
                ->count();

            $mrr = $mrrMap[$client->plan_code] ?? 29;

            return [
                'id' => $client->id,
                'name' => $client->name,
                'plan_code' => $client->plan_code,
                'plan_name' => $client->plan_name ?? ucfirst((string) $client->plan_code),
                'timezone' => $client->timezone,
                'created_at' => $client->created_at,
                'status' => $client->status ?? 'active',
                'mrr' => $mrr,
                'owner' => [
                    'id' => $client->owner_id,
                    'name' => $client->owner_name,
                    'email' => $client->owner_email,
                ],
                'stats' => [
                    'members_count' => max(1, $memberCount),
                    'medications_count' => $medicationCount,
                    'active_alerts_count' => $activeAlertsCount,
                ],
            ];
        });

        return response()->json(['data' => $enriched]);
    }

    public function show(int $id): JsonResponse
    {
        $db = $this->ownerConnection();
        $this->auditPlatformRead('platform.client_detail_viewed', ['care_circle_id' => $id]);

        $client = $db->table('care_circles')
            ->join('users', 'care_circles.owner_user_id', '=', 'users.id')
            ->leftJoin('plans', 'care_circles.plan_code', '=', 'plans.code')
            ->where('care_circles.id', $id)
            ->select([
                'care_circles.id',
                'care_circles.name',
                'care_circles.plan_code',
                'care_circles.timezone',
                'care_circles.quiet_hours_start',
                'care_circles.quiet_hours_end',
                'care_circles.created_at',
                'care_circles.updated_at',
                'users.id as owner_id',
                'users.name as owner_name',
                'users.email as owner_email',
                'plans.name as plan_name',
                'plans.seats as plan_seats',
                'plans.medications as plan_medications',
                'plans.voice_minutes as plan_voice_minutes',
            ])
            ->first();

        if (! $client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        $members = $db->table('care_circle_members')
            ->join('users', 'care_circle_members.user_id', '=', 'users.id')
            ->where('care_circle_members.care_circle_id', $id)
            ->select([
                'care_circle_members.id',
                'care_circle_members.role',
                'care_circle_members.status',
                'care_circle_members.created_at',
                'users.id as user_id',
                'users.name',
                'users.email',
            ])
            ->get();

        $medications = $db->table('medications')
            ->where('care_circle_id', $id)
            ->select(['id', 'name', 'dosage', 'frequency', 'stock_quantity', 'low_stock_threshold', 'created_at'])
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'dosage' => $m->dosage,
                'frequency' => $m->frequency,
                'stock_quantity' => $m->stock_quantity,
                'is_low_stock' => $m->stock_quantity <= $m->low_stock_threshold,
                'created_at' => $m->created_at,
            ]);

        $alerts = $db->table('emergency_alerts')
            ->where('care_circle_id', $id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->select(['id', 'type', 'status', 'created_at', 'acknowledged_at', 'resolved_at'])
            ->get();

        $mrrMap = [
            'starter' => 19,
            'family' => 39,
            'concierge' => 79,
            'essential' => 19,
            'comprehensive' => 39,
        ];

        return response()->json([
            'data' => [
                'id' => $client->id,
                'name' => $client->name,
                'plan_code' => $client->plan_code,
                'plan_name' => $client->plan_name ?? ucfirst((string) $client->plan_code),
                'plan_limits' => [
                    'seats' => $client->plan_seats,
                    'medications' => $client->plan_medications,
                    'voice_minutes' => $client->plan_voice_minutes,
                ],
                'timezone' => $client->timezone,
                'quiet_hours_start' => $client->quiet_hours_start,
                'quiet_hours_end' => $client->quiet_hours_end,
                'created_at' => $client->created_at,
                'status' => $client->status ?? 'active',
                'mrr' => $mrrMap[$client->plan_code] ?? 29,
                'billing' => [
                    'cycle' => 'monthly',
                    'next_billing_date' => now()->addDays(22)->toIso8601String(),
                    'payment_method' => 'Visa ending in 4242',
                    'payment_status' => 'paid',
                ],
                'owner' => [
                    'id' => $client->owner_id,
                    'name' => $client->owner_name,
                    'email' => $client->owner_email,
                ],
                'members' => $members,
                'medications' => $medications,
                'recent_alerts' => $alerts,
            ],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $db = $this->ownerConnection();
        $payload = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'plan_code' => ['nullable', 'string', 'exists:plans,code'],
        ]);

        $db->table('care_circles')->where('id', $id)->update(array_filter([
            'name' => $payload['name'] ?? null,
            'timezone' => $payload['timezone'] ?? null,
            'plan_code' => $payload['plan_code'] ?? null,
            'updated_at' => now(),
        ]));

        $this->auditPlatformRead('platform.client_updated', ['care_circle_id' => $id, 'changes' => $payload]);

        return response()->json(['message' => 'Care circle details updated.']);
    }

    public function suspend(int $id): JsonResponse
    {
        $db = $this->ownerConnection();
        $db->table('care_circles')->where('id', $id)->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'updated_at' => now(),
        ]);

        $this->auditPlatformRead('platform.client_suspended', ['care_circle_id' => $id]);

        return response()->json(['message' => 'Care circle workspace suspended.']);
    }

    public function activate(int $id): JsonResponse
    {
        $db = $this->ownerConnection();
        $db->table('care_circles')->where('id', $id)->update([
            'status' => 'active',
            'suspended_at' => null,
            'updated_at' => now(),
        ]);

        $this->auditPlatformRead('platform.client_activated', ['care_circle_id' => $id]);

        return response()->json(['message' => 'Care circle workspace reactivated.']);
    }

    public function bulkSuspend(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        $db = $this->ownerConnection();

        $affected = $db->table('care_circles')->whereIn('id', $ids)->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'updated_at' => now(),
        ]);

        $this->auditPlatformRead('platform.bulk_clients_suspended', ['ids' => $ids, 'count' => $affected]);

        return response()->json(['message' => "{$affected} households suspended.", 'affected' => $affected]);
    }

    public function bulkActivate(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        $db = $this->ownerConnection();

        $affected = $db->table('care_circles')->whereIn('id', $ids)->update([
            'status' => 'active',
            'suspended_at' => null,
            'updated_at' => now(),
        ]);

        $this->auditPlatformRead('platform.bulk_clients_activated', ['ids' => $ids, 'count' => $affected]);

        return response()->json(['message' => "{$affected} households reactivated.", 'affected' => $affected]);
    }

    public function exportCsv(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $db = $this->ownerConnection();
        $this->auditPlatformRead('platform.clients_exported');

        $query = $db->table('care_circles')
            ->join('users', 'care_circles.owner_user_id', '=', 'users.id')
            ->select([
                'care_circles.id',
                'care_circles.name',
                'care_circles.plan_code',
                'care_circles.timezone',
                'care_circles.status',
                'care_circles.created_at',
                'users.name as owner_name',
                'users.email as owner_email',
            ]);

        $clients = $query->orderBy('care_circles.id')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="carecircle_clients_' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($clients) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Circle Name', 'Plan', 'Timezone', 'Status', 'Owner Name', 'Owner Email', 'Created At']);

            foreach ($clients as $client) {
                fputcsv($handle, [
                    $client->id,
                    $client->name,
                    $client->plan_code,
                    $client->timezone,
                    $client->status ?? 'active',
                    $client->owner_name,
                    $client->owner_email,
                    $client->created_at,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
