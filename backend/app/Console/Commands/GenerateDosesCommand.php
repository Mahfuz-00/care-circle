<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\CareCircle;
use App\Models\Medication;
use App\Services\Scheduling\DoseScheduler;
use App\Support\CareCircleContext;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Turns every active medication's schedule into concrete dose instances.
 *
 * This is a system operation with no acting user, so it walks the circles on the
 * owner connection and then sets the RLS context per circle before touching any
 * tenant data.
 */
class GenerateDosesCommand extends Command
{
    protected $signature = 'carecircle:generate-doses {--date= : The date to generate for (Y-m-d)}';

    protected $description = 'Generate scheduled medication doses for a date';

    public function handle(DoseScheduler $scheduler, CareCircleContext $context): int
    {
        $date = CarbonImmutable::parse($this->option('date') ?? 'today');
        $this->info("Generating doses for {$date->toDateString()}…");

        $created = 0;
        $circleIds = DB::connection('pgsql_migrations')->table('care_circles')->pluck('id');

        try {
            foreach ($circleIds as $circleId) {
                $context->apply((int) $circleId, null);

                if (CareCircle::find($circleId) === null) {
                    continue;
                }

                Medication::query()
                    ->where('care_circle_id', $circleId)
                    ->where('is_active', true)
                    ->each(function (Medication $medication) use ($scheduler, $date, &$created): void {
                        $created += $scheduler->generateForMedication($medication, $date);
                    });
            }
        } finally {
            $context->forget();
        }

        $this->info("Created {$created} dose(s).");

        return self::SUCCESS;
    }
}
