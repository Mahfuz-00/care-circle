<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\PlanCode;
use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;

/**
 * The plan catalogue (PRD §8).
 *
 * This is the only `/api/v1` endpoint that does not require a token: it is the
 * pricing the public marketing page renders. It reads the `plans` table rather
 * than a hard-coded list, so the page cannot drift from the limits the API
 * actually enforces (`PlanCode::limits()` seeds this table).
 */
class PlanController extends Controller
{
    public function index(): JsonResponse
    {
        // Order by the catalogue's own sequence, not alphabetically.
        $order = array_flip(array_map(
            static fn (PlanCode $plan): string => $plan->value,
            PlanCode::cases(),
        ));

        $plans = Plan::query()
            ->get()
            ->sortBy(static fn (Plan $plan): int => $order[$plan->code] ?? PHP_INT_MAX)
            ->values();

        return response()->json(['data' => PlanResource::collection($plans)]);
    }
}
