<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants;
use Illuminate\Http\JsonResponse;

/**
 * PRD §10 — "What has failed in the background?"
 */
class FailedJobController extends Controller
{
    use ReadsAcrossTenants;

    public function index(): JsonResponse
    {
        $jobs = $this->ownerConnection()
            ->table('failed_jobs')
            ->latest('failed_at')
            ->limit(50)
            ->get()
            ->map(fn ($job) => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'connection' => $job->connection,
                'queue' => $job->queue,
                // The exception is truncated: the console needs to know a job
                // failed and why at a glance, not a full stack trace.
                'exception' => str($job->exception)->limit(400)->toString(),
                'failed_at' => $job->failed_at,
            ]);

        $this->auditPlatformRead('platform.failed_jobs_viewed');

        return response()->json(['data' => $jobs]);
    }
}
