<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Resources\SystemCheckResource;
use App\Services\Health\HealthChecker;
use Illuminate\Http\JsonResponse;

/**
 * PRD §10 — "Is the system healthy right now?" answered by measuring, not
 * guessing. Every check reports ok / warn / fail / skipped and says why.
 */
class HealthController extends Controller
{
    public function __construct(private readonly HealthChecker $checker) {}

    public function index(): JsonResponse
    {
        $checks = $this->checker->run();

        return response()->json(['data' => SystemCheckResource::collection($checks)]);
    }

    public function clearCache(): JsonResponse
    {
        \Illuminate\Support\Facades\Cache::flush();

        return response()->json([
            'message' => 'Application cache flushed successfully.',
        ]);
    }
}
