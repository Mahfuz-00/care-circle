<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EscalationChannel;
use App\Enums\EscalationStatus;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'care_circle_id', 'subject_type', 'subject_id', 'channel', 'status',
    'reason', 'target_user_id', 'provider_message_id', 'detail', 'attempted_at',
])]
class EscalationAttempt extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'channel' => EscalationChannel::class,
            'status' => EscalationStatus::class,
            'attempted_at' => 'datetime',
        ];
    }

    /** @return MorphTo<Model, $this> */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /** @return BelongsTo<User, $this> */
    public function target(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
