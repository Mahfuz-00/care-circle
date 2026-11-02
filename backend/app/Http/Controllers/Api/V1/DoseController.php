<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Http\Controllers\Concerns\MarksDoses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dose\SkipDoseRequest;
use App\Http\Requests\Dose\SnoozeDoseRequest;
use App\Http\Requests\Dose\TakeDoseRequest;
use App\Http\Resources\DoseResource;
use App\Models\CareCircleMember;
use App\Models\MedicationDose;
use App\Services\Auditing\AuditLogger;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoseController extends Controller
{
    use MarksDoses;

    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * Today's doses for the subject of the care circle (or a named member).
     */
    public function today(Request $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $userId = $request->integer('user_id') ?: $this->subjectUserId($careCircleId);
        $date = CarbonImmutable::parse($request->string('date')->toString() ?: 'today');

        $doses = MedicationDose::query()
            ->with(['medication', 'markedBy'])
            ->where('care_circle_id', $careCircleId)
            ->whereHas('medication', fn ($query) => $query->where('owner_user_id', $userId))
            ->whereBetween('scheduled_for', [$date->startOfDay(), $date->endOfDay()])
            ->orderBy('scheduled_for')
            ->get();

        return response()->json(['data' => DoseResource::collection($doses)]);
    }

    public function take(TakeDoseRequest $request, MedicationDose $dose): JsonResponse
    {
        $this->authorizeDose($dose);

        $dose = $this->markTaken($dose, $this->actor(), $request->validated('photo'));

        $this->audit->log('dose.taken', $this->actor(), (int) $dose->care_circle_id, AuditLevel::Info, [
            'dose_id' => $dose->id,
            'medication_id' => $dose->medication_id,
        ], $dose);

        // A completed dose stops all further escalation — PRD §13.
        return response()->json(['data' => new DoseResource($dose->load('medication', 'markedBy'))]);
    }

    public function skip(SkipDoseRequest $request, MedicationDose $dose): JsonResponse
    {
        $this->authorizeDose($dose);

        $dose = $this->markSkipped($dose, $this->actor(), $request->validated('reason'));

        $this->audit->log('dose.skipped', $this->actor(), (int) $dose->care_circle_id, AuditLevel::Info, [
            'dose_id' => $dose->id,
            'reason' => $dose->skip_reason,
        ], $dose);

        return response()->json(['data' => new DoseResource($dose->load('medication', 'markedBy'))]);
    }

    public function snooze(SnoozeDoseRequest $request, MedicationDose $dose): JsonResponse
    {
        $this->authorizeDose($dose);

        $dose = $this->markSnoozed($dose, $this->actor(), (int) $request->validated('minutes'));

        $this->audit->log('dose.snoozed', $this->actor(), (int) $dose->care_circle_id, AuditLevel::Info, [
            'dose_id' => $dose->id,
            'minutes' => $request->validated('minutes'),
        ], $dose);

        return response()->json(['data' => new DoseResource($dose->load('medication', 'markedBy'))]);
    }

    /**
     * A dose may only be touched by someone who can mark doses in this circle.
     * RLS has already ensured the dose belongs to the active circle.
     */
    private function authorizeDose(MedicationDose $dose): void
    {
        $this->requirePermission('mark_doses', (int) $dose->care_circle_id);
    }

    private function subjectUserId(int $careCircleId): int
    {
        $subject = CareCircleMember::query()
            ->where('care_circle_id', $careCircleId)
            ->whereIn('role', ['senior', 'self_user'])
            ->orderBy('id')
            ->first();

        return (int) ($subject?->user_id ?? $this->actor()->id);
    }
}
