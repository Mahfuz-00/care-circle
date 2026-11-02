<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medication\RefillMedicationRequest;
use App\Http\Requests\Medication\StoreMedicationRequest;
use App\Http\Requests\Medication\UpdateMedicationRequest;
use App\Http\Resources\MedicationResource;
use App\Models\CareCircle;
use App\Models\Medication;
use App\Services\Auditing\AuditLogger;
use App\Services\Stock\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly StockService $stock,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $medications = Medication::query()
            ->with('owner')
            ->where('care_circle_id', $careCircleId)
            ->when($request->filled('owner_user_id'), fn ($query) => $query->where('owner_user_id', $request->integer('owner_user_id')))
            // Default to active medications; inactive ones are retired, not deleted.
            ->when(! $request->boolean('include_inactive'), fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get();

        return response()->json(['data' => MedicationResource::collection($medications)]);
    }

    public function store(StoreMedicationRequest $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $membership = $this->membership($careCircleId);

        $ownerUserId = $request->validated('owner_user_id') ?? $this->actor()->id;

        // You may always add your own medication; adding someone else's needs the
        // caregiver permission from PRD §6.
        if ($ownerUserId !== $this->actor()->id) {
            abort_unless($membership->hasPermission('edit_circle_medications'), 403, 'Your role cannot add medications for another member.');
        }

        $this->assertMedicationQuota($careCircleId);

        $medication = Medication::create($request->validated() + [
            'care_circle_id' => $careCircleId,
            'owner_user_id' => $ownerUserId,
        ]);

        $this->audit->log('medication.created', $this->actor(), $careCircleId, AuditLevel::Notice, [
            'medication_id' => $medication->id,
            'name' => $medication->name,
        ], $medication);

        return response()->json(['data' => new MedicationResource($medication->load('owner'))], 201);
    }

    public function show(Medication $medication): JsonResponse
    {
        $this->membership((int) $medication->care_circle_id);

        return response()->json(['data' => new MedicationResource($medication->load('owner'))]);
    }

    public function update(UpdateMedicationRequest $request, Medication $medication): JsonResponse
    {
        $this->authorizeMutation($medication);

        $medication->update($request->validated());

        $this->audit->log('medication.updated', $this->actor(), (int) $medication->care_circle_id, AuditLevel::Notice, $request->validated(), $medication);

        return response()->json(['data' => new MedicationResource($medication->load('owner'))]);
    }

    /**
     * Retire a medication. History is preserved — a deleted medication would take
     * its adherence record with it, and PRD §13 needs that history.
     */
    public function destroy(Medication $medication): JsonResponse
    {
        $this->authorizeMutation($medication);

        $medication->update(['is_active' => false]);

        $this->audit->log('medication.retired', $this->actor(), (int) $medication->care_circle_id, AuditLevel::Warning, [
            'medication_id' => $medication->id,
        ], $medication);

        return response()->json(['data' => ['message' => 'Medication retired.']]);
    }

    public function refill(RefillMedicationRequest $request, Medication $medication): JsonResponse
    {
        $this->authorizeMutation($medication);

        $this->stock->refill(
            $medication,
            (int) $request->validated('quantity'),
            $this->actor(),
            $request->validated('note'),
        );

        $this->audit->log('medication.refilled', $this->actor(), (int) $medication->care_circle_id, AuditLevel::Info, [
            'medication_id' => $medication->id,
            'quantity' => $request->validated('quantity'),
        ], $medication);

        return response()->json(['data' => new MedicationResource($medication->refresh()->load('owner'))]);
    }

    private function authorizeMutation(Medication $medication): void
    {
        $careCircleId = (int) $medication->care_circle_id;
        $membership = $this->membership($careCircleId);

        if ($medication->owner_user_id === $this->actor()->id) {
            abort_unless($membership->hasPermission('manage_own_medications'), 403, 'Your role cannot edit medications.');

            return;
        }

        abort_unless($membership->hasPermission('edit_circle_medications'), 403, 'Your role cannot edit another member\'s medications.');
    }

    /**
     * PRD §8 — caps are enforced by the API, not just displayed.
     */
    private function assertMedicationQuota(int $careCircleId): void
    {
        $limit = CareCircle::find($careCircleId)?->medicationLimit();

        if ($limit === null) {
            return;
        }

        $count = Medication::query()->where('care_circle_id', $careCircleId)->where('is_active', true)->count();

        abort_if($count >= $limit, 422, "Your plan tracks up to {$limit} medications.");
    }
}
