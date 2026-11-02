<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use App\Enums\DoseStatus;
use App\Models\MedicationDose;
use App\Models\User;
use App\Services\Stock\StockService;

/**
 * The "I took it" / "Skip" / "Snooze" actions from PRD §5.1, shared by both
 * client surfaces so the two can never diverge.
 */
trait MarksDoses
{
    protected function markTaken(MedicationDose $dose, User $actor, ?string $photo = null): MedicationDose
    {
        abort_if(
            $dose->status === DoseStatus::Taken,
            409,
            'This dose is already recorded as taken.',
        );

        $dose->update([
            'status' => DoseStatus::Taken,
            'taken_at' => now(),
            'marked_by_user_id' => $actor->id,
            'confirmation_photo_path' => $photo,
        ]);

        // Taking a dose consumes stock and may cross the refill threshold.
        app(StockService::class)->recordDoseTaken($dose->medication, $actor);

        return $dose->refresh();
    }

    protected function markSkipped(MedicationDose $dose, User $actor, ?string $reason): MedicationDose
    {
        abort_if($dose->status->isClosed(), 409, 'This dose has already been closed.');

        $dose->update([
            'status' => DoseStatus::Skipped,
            'skip_reason' => $reason,
            'marked_by_user_id' => $actor->id,
        ]);

        return $dose->refresh();
    }

    protected function markSnoozed(MedicationDose $dose, User $actor, int $minutes): MedicationDose
    {
        abort_if($dose->status->isClosed(), 409, 'This dose has already been closed.');

        $dose->update([
            'status' => DoseStatus::Snoozed,
            'snoozed_until' => now()->addMinutes($minutes),
            'snooze_count' => $dose->snooze_count + 1,
            'marked_by_user_id' => $actor->id,
        ]);

        return $dose->refresh();
    }
}
