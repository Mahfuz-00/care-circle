<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\DoseStatus;
use App\Enums\EscalationChannel;
use App\Models\MedicationDose;
use App\Services\Escalation\EscalationEngine;
use App\Support\CareCircleContext;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Runs one escalation pass for every overdue, high-priority dose. The gates in
 * EscalationPolicy decide what actually happens — most passes will record a
 * skip, and that is the intended behaviour.
 */
class EscalateDosesCommand extends Command
{
    protected $signature = 'carecircle:escalate';

    protected $description = 'Escalate overdue high-priority doses to the care circle';

    public function handle(EscalationEngine $engine, CareCircleContext $context): int
    {
        $sent = 0;
        $skipped = 0;

        $circleIds = DB::connection('pgsql_migrations')->table('care_circles')->pluck('id');

        try {
            foreach ($circleIds as $circleId) {
                $context->apply((int) $circleId, null);

                $doses = MedicationDose::query()
                    ->with('medication')
                    ->where('care_circle_id', $circleId)
                    ->where('status', DoseStatus::Pending->value)
                    ->where('scheduled_for', '<=', now())
                    ->whereHas('medication', fn ($query) => $query->where('is_high_priority', true))
                    ->get();

                foreach ($doses as $dose) {
                    foreach ($engine->attempt($dose, EscalationChannel::Push) as $attempt) {
                        $attempt->status->value === 'sent' ? $sent++ : $skipped++;
                    }
                }
            }
        } finally {
            $context->forget();
        }

        $this->info("Escalation pass complete: {$sent} sent, {$skipped} skipped.");

        return self::SUCCESS;
    }
}
