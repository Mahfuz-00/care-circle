<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\CareCircle;
use Illuminate\Http\JsonResponse;

/**
 * PRD §5.3 — "A senior can always see who has access." This is that view.
 */
class CareCircleController extends Controller
{
    public function show(): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $circle = CareCircle::with(['members.user' => fn ($query) => $query->orderBy('name')])
            ->findOrFail($careCircleId);

        return response()->json([
            'data' => [
                'id' => $circle->id,
                'name' => $circle->name,
                'members' => MemberResource::collection($circle->members),
            ],
        ]);
    }
}
