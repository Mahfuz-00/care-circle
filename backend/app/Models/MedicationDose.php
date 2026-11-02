<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\DoseStatus;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'care_circle_id', 'medication_id', 'scheduled_for', 'status', 'taken_at',
    'marked_by_user_id', 'confirmation_photo_path', 'skip_reason', 'snoozed_until', 'snooze_count',
])]
class MedicationDose extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => DoseStatus::class,
            'scheduled_for' => 'datetime',
            'taken_at' => 'datetime',
            'snoozed_until' => 'datetime',
        ];
    }

    /** @return BelongsTo<Medication, $this> */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }

    /** @return BelongsTo<User, $this> */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by_user_id');
    }

    public function isOverdue(): bool
    {
        return $this->status === DoseStatus::Pending && $this->scheduled_for->isPast();
    }
}
