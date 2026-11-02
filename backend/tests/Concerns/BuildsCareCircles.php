<?php

declare(strict_types=1);

namespace Tests\Concerns;

use App\Enums\MemberRole;
use App\Enums\MemberStatus;
use App\Enums\PlanCode;
use App\Models\CareCircle;
use App\Models\CareCircleMember;
use App\Models\User;

trait BuildsCareCircles
{
    protected function makeUser(array $attributes = []): User
    {
        return User::create(array_merge([
            'name' => 'Test Person',
            'email' => 'person'.uniqid().'@carecircle.test',
            'password' => 'password',
            'timezone' => 'UTC',
        ], $attributes));
    }

    /**
     * @return array{circle: CareCircle, senior: User, primary: User, caregiver: User}
     */
    protected function makeCircle(?User $primary = null, array $circleAttributes = []): array
    {
        $senior = $this->makeUser(['name' => 'Senior '.uniqid(), 'phone' => '+15550000001', 'phone_verified_at' => now()]);
        $primary ??= $this->makeUser(['name' => 'Primary '.uniqid(), 'phone' => '+15550000002', 'phone_verified_at' => now()]);
        $caregiver = $this->makeUser(['name' => 'Caregiver '.uniqid(), 'phone' => '+15550000003', 'phone_verified_at' => now()]);

        $circle = CareCircle::create(array_merge([
            'name' => 'Circle '.uniqid(),
            'owner_user_id' => $primary->id,
            'plan_code' => PlanCode::Family,
            'timezone' => 'UTC',
        ], $circleAttributes));

        $this->addMember($circle, $senior, MemberRole::Senior);
        $this->addMember($circle, $primary, MemberRole::PrimaryCaregiver, voiceConsent: true);
        $this->addMember($circle, $caregiver, MemberRole::Caregiver);

        return ['circle' => $circle, 'senior' => $senior, 'primary' => $primary, 'caregiver' => $caregiver];
    }

    protected function addMember(
        CareCircle $circle,
        User $user,
        MemberRole $role,
        bool $voiceConsent = false,
    ): CareCircleMember {
        return CareCircleMember::create([
            'care_circle_id' => $circle->id,
            'user_id' => $user->id,
            'role' => $role,
            'status' => MemberStatus::Active,
            'accepted_at' => now(),
            'receive_emergency_alerts' => ! $role->isSubject(),
            'voice_consent' => $voiceConsent,
        ]);
    }
}
