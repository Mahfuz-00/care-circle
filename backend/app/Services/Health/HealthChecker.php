<?php

declare(strict_types=1);

namespace App\Services\Health;

use App\Enums\CheckStatus;
use App\Models\BackupRun;
use App\Models\SystemCheck;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * PRD §9 — "Nothing is reported that was not measured. Health checks that cannot
 * run report `fail`; backups with no dump tool are `skipped`."
 *
 * Every check therefore answers one of four things honestly: ok, warn, fail, or
 * skipped — never a green light it did not earn.
 */
final class HealthChecker
{
    /**
     * @return list<SystemCheck>
     */
    public function run(): array
    {
        return array_map(
            fn (array $check) => SystemCheck::create($check + ['measured_at' => now()]),
            [
                $this->database(),
                $this->cache(),
                $this->queue(),
                $this->storage(),
                $this->scheduler(),
                $this->backups(),
            ],
        );
    }

    /** @return array{key:string,status:string,message:string,meta:array<string,mixed>} */
    private function database(): array
    {
        try {
            // Query through the restricted runtime role — that is the connection
            // that actually serves requests.
            DB::select('select 1');

            return $this->result('database', CheckStatus::Ok, 'Database reachable as the runtime role.');
        } catch (Throwable $e) {
            return $this->result('database', CheckStatus::Fail, 'Database unreachable: '.$e->getMessage());
        }
    }

    /** @return array{key:string,status:string,message:string,meta:array<string,mixed>} */
    private function cache(): array
    {
        try {
            $key = 'health:probe';
            Cache::put($key, 'ok', 10);
            $value = Cache::get($key);
            Cache::forget($key);

            return $value === 'ok'
                ? $this->result('cache', CheckStatus::Ok, 'Cache read/write OK.')
                : $this->result('cache', CheckStatus::Fail, 'Cache write did not read back.');
        } catch (Throwable $e) {
            return $this->result('cache', CheckStatus::Fail, 'Cache error: '.$e->getMessage());
        }
    }

    /** @return array{key:string,status:string,message:string,meta:array<string,mixed>} */
    private function queue(): array
    {
        try {
            $pending = DB::table('jobs')->count();
            $failed = DB::table('failed_jobs')->count();

            return $this->result(
                'queue',
                $failed > 0 ? CheckStatus::Warn : CheckStatus::Ok,
                "{$pending} pending job(s), {$failed} failed job(s).",
                ['pending' => $pending, 'failed' => $failed],
            );
        } catch (Throwable $e) {
            return $this->result('queue', CheckStatus::Fail, 'Queue tables unreachable: '.$e->getMessage());
        }
    }

    /** @return array{key:string,status:string,message:string,meta:array<string,mixed>} */
    private function storage(): array
    {
        try {
            $probe = 'health/probe.txt';
            Storage::put($probe, 'ok');
            $readable = Storage::get($probe) === 'ok';
            Storage::delete($probe);

            return $readable
                ? $this->result('storage', CheckStatus::Ok, 'Storage writable.')
                : $this->result('storage', CheckStatus::Fail, 'Storage wrote but could not read back.');
        } catch (Throwable $e) {
            return $this->result('storage', CheckStatus::Fail, 'Storage error: '.$e->getMessage());
        }
    }

    /**
     * The scheduler proves it is alive by touching a heartbeat key. If the key
     * has never been written we cannot claim the scheduler runs — so we fail.
     */
    private function scheduler(): array
    {
        $last = Cache::get('health:scheduler:heartbeat');

        if ($last === null) {
            return $this->result('scheduler', CheckStatus::Fail, 'Scheduler has never reported a heartbeat.');
        }

        $ageMinutes = now()->diffInMinutes($last);

        return $ageMinutes > 15
            ? $this->result('scheduler', CheckStatus::Warn, "Scheduler heartbeat is {$ageMinutes} minutes old.", ['minutes' => $ageMinutes])
            : $this->result('scheduler', CheckStatus::Ok, 'Scheduler heartbeat is fresh.', ['minutes' => $ageMinutes]);
    }

    /**
     * With no dump tool installed there is nothing to measure, so this reports
     * `skipped` rather than pretending the backups are fine.
     */
    private function backups(): array
    {
        $binary = (string) config('care-circle.health.dump_binary');

        if (! $this->binaryExists($binary)) {
            return $this->result(
                'backups',
                CheckStatus::Skipped,
                "No dump tool found on PATH ({$binary}); backup readiness cannot be measured.",
            );
        }

        $newest = BackupRun::query()->whereNotNull('verified_at')->latest('verified_at')->first();

        if ($newest === null) {
            return $this->result('backups', CheckStatus::Fail, 'Dump tool present but no verified backup exists.');
        }

        $freshnessHours = (int) config('care-circle.health.backup_freshness_hours');
        $ageHours = (int) $newest->verified_at->diffInHours(now());

        return $ageHours > $freshnessHours
            ? $this->result('backups', CheckStatus::Warn, "Newest verified backup is {$ageHours}h old.", ['hours' => $ageHours])
            : $this->result('backups', CheckStatus::Ok, "Newest verified backup is {$ageHours}h old.", ['hours' => $ageHours]);
    }

    private function binaryExists(string $binary): bool
    {
        $path = trim((string) shell_exec(PHP_OS_FAMILY === 'Windows' ? "where {$binary} 2>NUL" : "command -v {$binary} 2>/dev/null"));

        return $path !== '';
    }

    /**
     * @param  array<string, mixed>  $meta
     * @return array{key:string,status:string,message:string,meta:array<string,mixed>}
     */
    private function result(string $key, CheckStatus $status, string $message, array $meta = []): array
    {
        return ['key' => $key, 'status' => $status->value, 'message' => $message, 'meta' => $meta];
    }
}
