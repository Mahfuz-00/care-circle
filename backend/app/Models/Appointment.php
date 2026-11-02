<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AppointmentType;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'care_circle_id', 'owner_user_id', 'created_by_user_id', 'title', 'type',
    'location', 'starts_at', 'notes', 'shared_with_circle', 'reminder_offsets',
])]
class Appointment extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AppointmentType::class,
            'starts_at' => 'datetime',
            'shared_with_circle' => 'boolean',
            'reminder_offsets' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }
}
