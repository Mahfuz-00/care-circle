<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Models\CareCircle;
use App\Models\PlatformSetting;
use App\Models\RefundRequest;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $policy = PlatformSetting::get('refund_policy', [
            'policy_markdown' => "# CareCircle Subscription Refund Policy\n\nCareCircle provides complete care coordination and medication reminders for families. If you or your care circle are not satisfied with your plan:\n\n### 14-Day Full Satisfaction Guarantee\nAll new subscriptions can be refunded in full within 14 days of enrollment.\n\n### Pro-Rata Policy for Annual Subscriptions\nUnused calendar months on annual care circle plans are refunded pro-rata upon request.",
            'refund_window_days' => 14,
            'monthly_refund_percent' => 100,
            'annual_refund_percent' => 85,
            'auto_approve_under_cents' => 0,
            'contact_email' => 'billing@carecircle.app',
        ]);

        $query = RefundRequest::query()
            ->with(['careCircle:id,name,plan_code,status', 'user:id,name,email', 'processor:id,name'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->latest('id');

        $refunds = $query->paginate(min(100, max(1, $request->integer('per_page', 15))));

        $stats = [
            'total_refunded_cents' => (int) RefundRequest::where('status', 'approved')->sum('amount_cents'),
            'pending_count' => RefundRequest::where('status', 'pending')->count(),
            'approved_count' => RefundRequest::where('status', 'approved')->count(),
            'rejected_count' => RefundRequest::where('status', 'rejected')->count(),
            'avg_turnaround_hours' => 8,
        ];

        return response()->json([
            'policy' => $policy,
            'refunds' => $refunds,
            'stats' => $stats,
        ]);
    }

    public function updatePolicy(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'policy_markdown' => ['required', 'string'],
            'refund_window_days' => ['required', 'integer', 'min:1'],
            'monthly_refund_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'annual_refund_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'contact_email' => ['required', 'email'],
        ]);

        PlatformSetting::set('refund_policy', $payload);

        $this->audit->log(
            action: 'platform.refund_policy_updated',
            actor: $request->user(),
            careCircleId: null,
            level: AuditLevel::Notice,
            payload: $payload,
        );

        return response()->json([
            'message' => 'Platform refund policy updated successfully.',
            'data' => $payload,
        ]);
    }

    public function checkEligibility(Request $request): JsonResponse
    {
        $circleId = $request->input('care_circle_id');
        $circle = CareCircle::find($circleId);

        if (! $circle) {
            return response()->json(['message' => 'Care circle not found.'], 404);
        }

        $policy = PlatformSetting::get('refund_policy', []);
        $windowDays = $policy['refund_window_days'] ?? 14;

        $created = $circle->created_at;
        $daysSince = (int) $created->diffInDays(now());
        $isEligible = $daysSince <= $windowDays;

        return response()->json([
            'eligible' => $isEligible,
            'days_active' => $daysSince,
            'window_limit_days' => $windowDays,
            'recommended_refund_cents' => $isEligible ? 3900 : 0,
            'reason' => $isEligible
                ? "Eligible for 100% money-back guarantee ({$daysSince} days active within {$windowDays}-day satisfaction window)."
                : "Standard satisfaction guarantee expired ({$daysSince} days active vs {$windowDays} days window). Pro-rata evaluation applies.",
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        $refund->status = 'approved';
        $refund->admin_notes = $request->input('admin_notes', 'Approved by administrator.');
        $refund->processed_by = $request->user()->id;
        $refund->processed_at = now();
        $refund->save();

        $this->audit->log(
            action: 'platform.refund_approved',
            actor: $request->user(),
            careCircleId: $refund->care_circle_id,
            level: AuditLevel::Notice,
            payload: [
                'refund_id' => $refund->id,
                'amount_cents' => $refund->amount_cents,
                'notes' => $refund->admin_notes,
            ],
        );

        return response()->json([
            'message' => 'Refund approved and scheduled for credit disbursement.',
            'data' => $refund->fresh(['careCircle', 'user']),
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        $refund->status = 'rejected';
        $refund->admin_notes = $request->input('admin_notes', 'Request does not meet refund policy eligibility.');
        $refund->processed_by = $request->user()->id;
        $refund->processed_at = now();
        $refund->save();

        $this->audit->log(
            action: 'platform.refund_rejected',
            actor: $request->user(),
            careCircleId: $refund->care_circle_id,
            level: AuditLevel::Warning,
            payload: [
                'refund_id' => $refund->id,
                'notes' => $refund->admin_notes,
            ],
        );

        return response()->json([
            'message' => 'Refund request rejected.',
            'data' => $refund->fresh(['careCircle', 'user']),
        ]);
    }
}
