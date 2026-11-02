<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;

class AppointmentController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $appointments = Appointment::query()
            ->with('owner')
            ->where('care_circle_id', $careCircleId)
            ->orderBy('starts_at')
            ->get();

        return response()->json(['data' => AppointmentResource::collection($appointments)]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $membership = $this->membership($careCircleId);

        $ownerUserId = $request->validated('owner_user_id') ?? $this->actor()->id;

        if ($ownerUserId !== $this->actor()->id) {
            abort_unless($membership->hasPermission('edit_circle_medications'), 403, 'Your role cannot add appointments for another member.');
        }

        $appointment = Appointment::create($request->validated() + [
            'care_circle_id' => $careCircleId,
            'owner_user_id' => $ownerUserId,
            'created_by_user_id' => $this->actor()->id,
        ]);

        $this->audit->log('appointment.created', $this->actor(), $careCircleId, AuditLevel::Notice, [
            'appointment_id' => $appointment->id,
        ], $appointment);

        return response()->json(['data' => new AppointmentResource($appointment->load('owner'))], 201);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $this->authorizeAppointment($appointment);

        $appointment->update($request->validated());

        $this->audit->log('appointment.updated', $this->actor(), (int) $appointment->care_circle_id, AuditLevel::Notice, $request->validated(), $appointment);

        return response()->json(['data' => new AppointmentResource($appointment->load('owner'))]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $this->authorizeAppointment($appointment);

        $this->audit->log('appointment.deleted', $this->actor(), (int) $appointment->care_circle_id, AuditLevel::Warning, [
            'appointment_id' => $appointment->id,
        ], $appointment);

        $appointment->delete();

        return response()->json(['data' => ['message' => 'Appointment removed.']]);
    }

    private function authorizeAppointment(Appointment $appointment): void
    {
        $careCircleId = (int) $appointment->care_circle_id;
        $membership = $this->membership($careCircleId);

        if ($appointment->owner_user_id === $this->actor()->id) {
            return;
        }

        abort_unless($membership->hasPermission('edit_circle_medications'), 403, 'Your role cannot change this appointment.');
    }
}
