<?php

declare(strict_types=1);

namespace App\Services\Adherence;

use App\Enums\DoseStatus;
use App\Models\MedicationDose;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

/**
 * PRD §5.1 — "Medication history and simple adherence percentage."
 * Only doses that reached a decided state count; a dose still pending is not a
 * failure, so it is excluded rather than counted against the user.
 */
final class AdherenceService
{
    public function __construct(private readonly int $minimumSample = 1) {}

    /**
     * @return array{taken:int, skipped:int, missed:int, total:int, percentage:float|null}
     */
    public function forUser(int $careCircleId, int $userId, ?CarbonInterface $from = null, ?CarbonInterface $to = null): array
    {
        $query = MedicationDose::query()
            ->where('care_circle_id', $careCircleId)
            ->whereHas('medication', fn (Builder $q) => $q->where('owner_user_id', $userId))
            ->when($from, fn (Builder $q) => $q->where('scheduled_for', '>=', $from))
            ->when($to, fn (Builder $q) => $q->where('scheduled_for', '<=', $to));

        return $this->summarise($query);
    }

    /**
     * @return array{taken:int, skipped:int, missed:int, total:int, percentage:float|null}
     */
    public function forCircle(int $careCircleId, ?CarbonInterface $from = null, ?CarbonInterface $to = null): array
    {
        $query = MedicationDose::query()
            ->where('care_circle_id', $careCircleId)
            ->when($from, fn (Builder $q) => $q->where('scheduled_for', '>=', $from))
            ->when($to, fn (Builder $q) => $q->where('scheduled_for', '<=', $to));

        return $this->summarise($query);
    }

    /**
     * @param  Builder<MedicationDose>  $query
     * @return array{taken:int, skipped:int, missed:int, total:int, percentage:float|null}
     */
    private function summarise(Builder $query): array
    {
        $counts = (clone $query)
            ->whereIn('status', [
                DoseStatus::Taken->value,
                DoseStatus::Skipped->value,
                DoseStatus::Missed->value,
            ])
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $taken = (int) ($counts[DoseStatus::Taken->value] ?? 0);
        $skipped = (int) ($counts[DoseStatus::Skipped->value] ?? 0);
        $missed = (int) ($counts[DoseStatus::Missed->value] ?? 0);
        $total = $taken + $skipped + $missed;

        return [
            'taken' => $taken,
            'skipped' => $skipped,
            'missed' => $missed,
            'total' => $total,
            // Null — not 0% — when there is nothing measured yet.
            'percentage' => $total >= $this->minimumSample
                ? round(($taken / $total) * 100, 1)
                : null,
        ];
    }
}
