<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Support\CareCircleContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The audit ledger, read for one care circle at a time. The circle comes from the
 * X-Care-Circle header, and RLS enforces that only that circle's rows are
 * returned — so an operator cannot accidentally read a neighbouring tenant's
 * ledger, and neither can a bug.
 */
class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // No active circle means no ledger to show. Fail closed, not open.
        if (app(CareCircleContext::class)->currentCareCircleId() === null) {
            return response()->json([
                'data' => [],
                'meta' => ['message' => 'Select a care circle (X-Care-Circle header) to read its audit ledger.'],
            ]);
        }

        $logs = AuditLog::query()
            ->when($request->filled('action'), fn ($query) => $query->where('action', $request->string('action')->toString()))
            ->when($request->filled('level'), fn ($query) => $query->where('level', $request->string('level')->toString()))
            ->latest('created_at')
            ->limit(200)
            ->get();

        return response()->json(['data' => AuditLogResource::collection($logs)]);
    }
}
