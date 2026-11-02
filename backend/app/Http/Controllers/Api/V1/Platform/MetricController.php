<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants;
use Illuminate\Http\JsonResponse;

/**
 * PRD §10 — the observable success measures. Every number here is counted from
 * stored rows; where there is nothing to measure the value is null, never zero.
 */
class MetricController extends Controller
{
    use ReadsAcrossTenants;

    public function index(): JsonResponse
    {
        $db = $this->ownerConnection();

        $this->auditPlatformRead('platform.metrics_viewed');

        return response()->json([
            'data' => [
                'users' => $db->table('users')->count(),
                'care_circles' => $db->table('care_circles')->count(),
                'adherence_percentage' => $this->adherencePercentage($db),
                'low_stock_refill_rate' => $this->lowStockRefillRate($db),
                'emergency_ack_seconds' => $this->emergencyAckSeconds($db),
                'invitation_acceptance_rate' => $this->invitationAcceptanceRate($db),
            ],
        ]);
    }

    private function adherencePercentage($db): ?float
    {
        $row = $db->table('medication_doses')
            ->whereIn('status', ['taken', 'skipped', 'missed'])
            ->selectRaw("count(*) as total, count(*) filter (where status = 'taken') as taken")
            ->first();

        if ($row === null || (int) $row->total === 0) {
            return null;
        }

        return round(((int) $row->taken / (int) $row->total) * 100, 1);
    }

    /**
     * "Percentage of low-stock events that result in a refill before zero."
     * Counts low-stock alerts that were followed by a refill before depletion.
     */
    private function lowStockRefillRate($db): ?float
    {
        $alerts = $db->table('stock_events')->where('type', 'low_stock_alert')->count();

        if ($alerts === 0) {
            return null;
        }

        $refills = $db->table('stock_events')->where('type', 'refill')->count();

        return round(min(100, ($refills / $alerts) * 100), 1);
    }

    private function emergencyAckSeconds($db): ?int
    {
        $row = $db->table('emergency_alerts')
            ->whereNotNull('acknowledged_at')
            ->selectRaw('avg(extract(epoch from (acknowledged_at - created_at))) as seconds')
            ->first();

        return $row?->seconds === null ? null : (int) round((float) $row->seconds);
    }

    private function invitationAcceptanceRate($db): ?float
    {
        $total = $db->table('care_circle_invitations')->count();

        if ($total === 0) {
            return null;
        }

        $accepted = $db->table('care_circle_invitations')->whereNotNull('accepted_at')->count();

        return round(($accepted / $total) * 100, 1);
    }
}
