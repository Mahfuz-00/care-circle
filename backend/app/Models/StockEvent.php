<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StockEventType;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'care_circle_id', 'medication_id', 'type', 'delta', 'resulting_quantity', 'note', 'actor_user_id',
])]
class StockEvent extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => StockEventType::class,
        ];
    }

    /** @return BelongsTo<Medication, $this> */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }

    /** @return BelongsTo<User, $this> */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
