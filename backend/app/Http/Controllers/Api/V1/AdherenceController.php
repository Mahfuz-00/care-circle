<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Adherence\AdherenceService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdherenceController extends Controller
{
    public function __construct(private readonly AdherenceService $adherence) {}

    public function show(Request $request): JsonResponse
    {
        $careCircleId = $this->careCircleId();
        $this->membership($careCircleId);

        $from = $request->filled('from') ? CarbonImmutable::parse($request->string('from')->toString()) : CarbonImmutable::now()->subDays(30);
        $to = $request->filled('to') ? CarbonImmutable::parse($request->string('to')->toString()) : CarbonImmutable::now();

        $summary = $request->filled('user_id')
            ? $this->adherence->forUser($careCircleId, $request->integer('user_id'), $from, $to)
            : $this->adherence->forCircle($careCircleId, $from, $to);

        return response()->json([
            'data' => $summary + [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }
}
