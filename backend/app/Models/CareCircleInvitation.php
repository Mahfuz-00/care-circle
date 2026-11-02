<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MemberRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['care_circle_id', 'email', 'phone', 'role', 'invited_by_user_id', 'expires_at'])]
class CareCircleInvitation extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => MemberRole::class,
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $invitation): void {
            $invitation->token ??= Str::random(64);
            $invitation->expires_at ??= now()->addDays(14);
        });
    }

    /** @return BelongsTo<CareCircle, $this> */
    public function careCircle(): BelongsTo
    {
        return $this->belongsTo(CareCircle::class);
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null && $this->expires_at->isFuture();
    }
}
