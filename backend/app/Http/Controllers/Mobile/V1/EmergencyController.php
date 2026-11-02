<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile\V1;

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

    public function store(RaiseEmergencyRequest $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $alert = $this->raiseEmergency($careCircleId, $this->actor(), $request->validated());

        $this->audit->log('emergency.raised', $this->actor(), $careCircleId, AuditLevel::Critical, [
            'alert_id' => $alert->id,
            'type' => $alert->type->value,
            'surface' => 'mobile',
        ], $alert);

        return response()->json(['data' => new EmergencyAlertResource($alert->load(['raisedBy', 'acknowledgedBy']))], 201);
    }

    public function show(EmergencyAlert $alert): JsonResponse
    {
        $this->membership((int) $alert->care_circle_id);

        return response()->json(['data' => new EmergencyAlertResource($alert->load(['raisedBy', 'acknowledgedBy']))]);
    }

    public function acknowledge(EmergencyAlert $alert): JsonResponse
    {
        $this->requirePermission('receive_emergency', (int) $alert->care_circle_id);

        if ($alert->acknowledged_at === null) {
            $alert->update([
                'status' => EmergencyStatus::Acknowledged,
                'acknowledged_by_user_id' => $this->actor()->id,
                'acknowledged_at' => now(),
            ]);

            $this->audit->log('emergency.acknowledged', $this->actor(), (int) $alert->care_circle_id, AuditLevel::Critical, [
                'alert_id' => $alert->id,
                'surface' => 'mobile',
            ], $alert);
        }

        return response()->json(['data' => new EmergencyAlertResource($alert->refresh()->load(['raisedBy', 'acknowledgedBy']))]);
    }
}
