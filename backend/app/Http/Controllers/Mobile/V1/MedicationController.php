<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MedicationResource;
use App\Models\Medication;
use Illuminate\Http\JsonResponse;

class MedicationController extends Controller
{
    public function index(): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $medications = Medication::query()
            ->with('owner')
            ->where('care_circle_id', $careCircleId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => MedicationResource::collection($medications)]);
    }
}
