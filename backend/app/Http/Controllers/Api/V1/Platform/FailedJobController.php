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

    public function retry(string|int $id): JsonResponse
    {
        $this->auditPlatformRead('platform.failed_job_retried', ['id' => $id]);

        try {
            \Illuminate\Support\Facades\Artisan::call('queue:retry', ['id' => [(string) $id]]);
            $output = \Illuminate\Support\Facades\Artisan::output();
        } catch (\Throwable $e) {
            $output = $e->getMessage();
        }

        return response()->json([
            'message' => "Job retry dispatched.",
            'output' => trim($output),
        ]);
    }

    public function retryAll(): JsonResponse
    {
        $this->auditPlatformRead('platform.all_failed_jobs_retried');

        try {
            \Illuminate\Support\Facades\Artisan::call('queue:retry', ['id' => ['all']]);
            $output = \Illuminate\Support\Facades\Artisan::output();
        } catch (\Throwable $e) {
            $output = $e->getMessage();
        }

        return response()->json([
            'message' => 'All failed jobs retry dispatched.',
            'output' => trim($output),
        ]);
    }

    public function flush(): JsonResponse
    {
        $this->auditPlatformRead('platform.failed_jobs_flushed');

        try {
            \Illuminate\Support\Facades\Artisan::call('queue:flush');
            $output = \Illuminate\Support\Facades\Artisan::output();
        } catch (\Throwable $e) {
            $output = $e->getMessage();
        }

        return response()->json([
            'message' => 'Failed jobs queue flushed.',
            'output' => trim($output),
        ]);
    }
}
