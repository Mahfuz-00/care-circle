<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'password', 'timezone', 'is_platform_admin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'password' => 'hashed',
            'is_platform_admin' => 'boolean',
        ];
    }

    /** @return HasMany<CareCircle, $this> */
    public function ownedCareCircles(): HasMany
    {
        return $this->hasMany(CareCircle::class, 'owner_user_id');
    }

    /** @return HasMany<CareCircleMember, $this> */
    public function memberships(): HasMany
    {
        return $this->hasMany(CareCircleMember::class);
    }

    /** @return HasMany<Medication, $this> */
    public function medications(): HasMany
    {
        return $this->hasMany(Medication::class, 'owner_user_id');
    }

    public function isPlatformAdmin(): bool
    {
        return $this->is_platform_admin === true;
    }

    /**
     * The care circle this user is currently acting in, resolved from membership.
     */
    public function membershipFor(int $careCircleId): ?CareCircleMember
    {
        return $this->memberships()
            ->where('care_circle_id', $careCircleId)
            ->where('status', 'active')
            ->first();
    }
}
