<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EmergencyStatus;
use App\Enums\EmergencyType;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'care_circle_id', 'raised_by_user_id', 'type', 'status', 'latitude', 'longitude',
    'location_label', 'note', 'acknowledged_by_user_id', 'acknowledged_at', 'resolved_at',
])]
class EmergencyAlert extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => EmergencyType::class,
            'status' => EmergencyStatus::class,
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function raisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by_user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by_user_id');
    }

    /** Seconds from raise to first acknowledgement — PRD §10. */
    public function acknowledgementSeconds(): ?int
    {
        if ($this->acknowledged_at === null) {
            return null;
        }

        return (int) $this->created_at->diffInSeconds($this->acknowledged_at);
    }
}
