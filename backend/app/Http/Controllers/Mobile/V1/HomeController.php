<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\CareCircleResource;
use App\Http\Resources\DoseResource;
use App\Models\Appointment;
use App\Models\CareCircle;
use App\Models\CareCircleMember;
use App\Models\EmergencyAlert;
use App\Models\MedicationDose;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

/**
 * One senior-first payload: what to take today, what is coming up, who is in the
 * circle, and whether anything needs attention. The app makes a single call on
 * open, not five.
 */
class HomeController extends Controller
{
    public function today(): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $membership = $this->membership($careCircleId);

        $subjectId = CareCircleMember::query()
            ->where('care_circle_id', $careCircleId)
            ->whereIn('role', ['senior', 'self_user'])
            ->orderBy('id')
            ->value('user_id') ?? $this->actor()->id;

        // A caregiver's home view still shows the circle's subject; a senior sees
        // themselves. Either way the circle context is the same.
        $focusUserId = $membership->role->isCaregiver() ? $subjectId : $this->actor()->id;

        $today = CarbonImmutable::now();

        $doses = MedicationDose::query()
            ->with(['medication', 'markedBy'])
            ->where('care_circle_id', $careCircleId)
            ->whereHas('medication', fn ($query) => $query->where('owner_user_id', $focusUserId))
            ->whereBetween('scheduled_for', [$today->startOfDay(), $today->endOfDay()])
            ->orderBy('scheduled_for')
            ->get();

        $appointments = Appointment::query()
            ->where('care_circle_id', $careCircleId)
            ->where('starts_at', '>=', $today->startOfDay())
            ->orderBy('starts_at')
            ->limit(10)
            ->get();

        $openAlerts = EmergencyAlert::query()
            ->where('care_circle_id', $careCircleId)
            ->whereIn('status', ['open', 'acknowledged'])
            ->count();

        return response()->json([
            'data' => [
                'doses' => DoseResource::collection($doses),
                'appointments' => AppointmentResource::collection($appointments),
                'care_circle' => new CareCircleResource(CareCircle::findOrFail($careCircleId)),
                'unread_alerts' => $openAlerts,
            ],
        ]);
    }
}
