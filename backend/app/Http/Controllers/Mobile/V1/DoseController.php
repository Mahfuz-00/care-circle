<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile\V1;

use App\Enums\AuditLevel;
use App\Http\Controllers\Concerns\MarksDoses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dose\SkipDoseRequest;
use App\Http\Requests\Dose\SnoozeDoseRequest;
use App\Http\Requests\Dose\TakeDoseRequest;
use App\Http\Resources\DoseResource;
use App\Models\MedicationDose;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;

/**
 * The same one-tap actions as the dashboard, sharing MarksDoses so the two
 * surfaces cannot drift apart.
 */
class DoseController extends Controller
{
    use MarksDoses;

    public function __construct(private readonly AuditLogger $audit) {}

    public function take(TakeDoseRequest $request, MedicationDose $dose): JsonResponse
    {
        $this->requirePermission('mark_doses', (int) $dose->care_circle_id);

        $dose = $this->markTaken($dose, $this->actor(), $request->validated('photo'));

        $this->audit->log('dose.taken', $this->actor(), (int) $dose->care_circle_id, AuditLevel::Info, ['dose_id' => $dose->id, 'surface' => 'mobile'], $dose);

        return response()->json(['data' => new DoseResource($dose->load('medication', 'markedBy'))]);
    }

    public function skip(SkipDoseRequest $request, MedicationDose $dose): JsonResponse
    {
        $this->requirePermission('mark_doses', (int) $dose->care_circle_id);

        $dose = $this->markSkipped($dose, $this->actor(), $request->validated('reason'));

        $this->audit->log('dose.skipped', $this->actor(), (int) $dose->care_circle_id, AuditLevel::Info, ['dose_id' => $dose->id, 'surface' => 'mobile'], $dose);

        return response()->json(['data' => new DoseResource($dose->load('medication', 'markedBy'))]);
    }

    public function snooze(SnoozeDoseRequest $request, MedicationDose $dose): JsonResponse
    {
        $this->requirePermission('mark_doses', (int) $dose->care_circle_id);

        $dose = $this->markSnoozed($dose, $this->actor(), (int) $request->validated('minutes'));

        $this->audit->log('dose.snoozed', $this->actor(), (int) $dose->care_circle_id, AuditLevel::Info, ['dose_id' => $dose->id, 'surface' => 'mobile'], $dose);

        return response()->json(['data' => new DoseResource($dose->load('medication', 'markedBy'))]);
    }
}
