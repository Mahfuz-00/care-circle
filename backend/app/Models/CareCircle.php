<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PlanCode;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'owner_user_id', 'plan_code', 'timezone', 'quiet_hours_start', 'quiet_hours_end'])]
class CareCircle extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'plan_code' => PlanCode::class,
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /** @return HasMany<CareCircleMember, $this> */
    public function members(): HasMany
    {
        return $this->hasMany(CareCircleMember::class);
    }

    /** @return HasMany<Medication, $this> */
    public function medications(): HasMany
    {
        return $this->hasMany(Medication::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** @return HasMany<EmergencyAlert, $this> */
    public function emergencyAlerts(): HasMany
    {
        return $this->hasMany(EmergencyAlert::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_code', 'code');
    }

    public function seatLimit(): ?int
    {
        return $this->plan_code->limits()['seats'];
    }

    public function medicationLimit(): ?int
    {
        return $this->plan_code->limits()['medications'];
    }
}
