<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\CareCircle;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Every care-circle-owned model is isolated by Row-Level Security at the database
 * level. This trait only adds the relation and a convenience scope — it is
 * deliberately not what enforces isolation.
 */
trait BelongsToCareCircle
{
    public function careCircle(): BelongsTo
    {
        return $this->belongsTo(CareCircle::class);
    }

    public function scopeForCircle(Builder $query, int $careCircleId): Builder
    {
        return $query->where($this->getTable().'.care_circle_id', $careCircleId);
    }
}
