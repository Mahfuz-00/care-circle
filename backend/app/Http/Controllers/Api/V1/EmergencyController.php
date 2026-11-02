<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Enums\EmergencyStatus;
use App\Http\Controllers\Concerns\HandlesEmergencies;
use App\Http\Controllers\Controller;
use App\Http\Requests\Emergency\RaiseEmergencyRequest;
use App\Http\Resources\EmergencyAlertResource;
use App\Models\EmergencyAlert;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;

class EmergencyController extends Controller
{
    use HandlesEmergencies;

    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $alerts = EmergencyAlert::query()
            ->with(['raisedBy', 'acknowledgedBy'])
            ->where('care_circle_id', $careCircleId)
            ->latest()
            ->limit(50)
            ->get();

        return response()->json(['data' => EmergencyAlertResource::collection($alerts)]);
    }

    public function store(RaiseEmergencyRequest $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $alert = $this->raiseEmergency($careCircleId, $this->actor(), $request->validated());

        $this->audit->log('emergency.raised', $this->actor(), $careCircleId, AuditLevel::Critical, [
            'alert_id' => $alert->id,
            'type' => $alert->type->value,
        ], $alert);

        return response()->json(['data' => new EmergencyAlertResource($alert->load(['raisedBy', 'acknowledgedBy']))], 201);
    }

    public function acknowledge(EmergencyAlert $alert): JsonResponse
    {
        $this->requirePermission('receive_emergency', (int) $alert->care_circle_id);

        // First acknowledgement wins; PRD §10 measures time to first acknowledgement.
        if ($alert->acknowledged_at === null) {
            $alert->update([
                'status' => EmergencyStatus::Acknowledged,
                'acknowledged_by_user_id' => $this->actor()->id,
                'acknowledged_at' => now(),
            ]);

            $this->audit->log('emergency.acknowledged', $this->actor(), (int) $alert->care_circle_id, AuditLevel::Critical, [
                'alert_id' => $alert->id,
                'seconds' => $alert->refresh()->acknowledgementSeconds(),
            ], $alert);
        }

        return response()->json(['data' => new EmergencyAlertResource($alert->refresh()->load(['raisedBy', 'acknowledgedBy']))]);
    }

    public function resolve(EmergencyAlert $alert): JsonResponse
    {
        $this->membership((int) $alert->care_circle_id);

        $alert->update(['status' => EmergencyStatus::Resolved, 'resolved_at' => now()]);

        $this->audit->log('emergency.resolved', $this->actor(), (int) $alert->care_circle_id, AuditLevel::Critical, [
            'alert_id' => $alert->id,
        ], $alert);

        return response()->json(['data' => new EmergencyAlertResource($alert->refresh()->load(['raisedBy', 'acknowledgedBy']))]);
    }

    public function cancel(EmergencyAlert $alert): JsonResponse
    {
        $this->membership((int) $alert->care_circle_id);

        // Only the person who raised it can stand it down.
        abort_unless($alert->raised_by_user_id === $this->actor()->id, 403, 'Only the person who raised this alert can cancel it.');

        $alert->update(['status' => EmergencyStatus::Cancelled, 'resolved_at' => now()]);

        $this->audit->log('emergency.cancelled', $this->actor(), (int) $alert->care_circle_id, AuditLevel::Warning, [
            'alert_id' => $alert->id,
        ], $alert);

        return response()->json(['data' => new EmergencyAlertResource($alert->refresh()->load(['raisedBy', 'acknowledgedBy']))]);
    }
}
