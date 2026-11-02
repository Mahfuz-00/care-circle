<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Health\HealthChecker;
use Illuminate\Console\Command;

/**
 * PRD §9 — "Nothing is reported that was not measured." The console shows what
 * this command measured, including the checks that could not run.
 */
class HealthCheckCommand extends Command
{
    protected $signature = 'carecircle:health';

    protected $description = 'Measure and record system health checks';

    public function handle(HealthChecker $checker): int
    {
        foreach ($checker->run() as $check) {
            $this->line(sprintf('  %-10s %-8s %s', $check->key, $check->status->value, $check->message));
        }

        return self::SUCCESS;
    }
}
