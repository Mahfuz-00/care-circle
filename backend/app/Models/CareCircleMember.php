<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MemberRole;
use App\Enums\MemberStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'care_circle_id', 'user_id', 'role', 'status', 'receive_emergency_alerts',
    'voice_consent', 'phone_verified_at', 'invited_by_user_id', 'accepted_at',
])]
class CareCircleMember extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => MemberRole::class,
            'status' => MemberStatus::class,
            'receive_emergency_alerts' => 'boolean',
            'voice_consent' => 'boolean',
            'phone_verified_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<CareCircle, $this> */
    public function careCircle(): BelongsTo
    {
        return $this->belongsTo(CareCircle::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, config("roles.roles.{$this->role->value}.permissions", []), true);
    }

    /** Every permission this member holds, for the dashboard matrix. */
    public function permissions(): array
    {
        return config("roles.roles.{$this->role->value}.permissions", []);
    }
}
