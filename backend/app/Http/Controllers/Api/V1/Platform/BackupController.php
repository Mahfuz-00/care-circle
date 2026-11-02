<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants;
use App\Http\Resources\BackupRunResource;
use App\Models\BackupRun;
use Illuminate\Http\JsonResponse;

/**
 * PRD §10 — "Could we restore, and how much would we lose?"
 * A run with no `verified_at` is reported as unverified rather than assumed good.
 */
class BackupController extends Controller
{
    use ReadsAcrossTenants;

    public function index(): JsonResponse
    {
        $runs = BackupRun::query()->latest('created_at')->limit(30)->get();

        $this->auditPlatformRead('platform.backups_viewed');

        return response()->json([
            'data' => BackupRunResource::collection($runs),
            'meta' => [
                'newest_verified_at' => BackupRun::query()->whereNotNull('verified_at')->latest('verified_at')->value('verified_at'),
            ],
        ]);
    }
}
