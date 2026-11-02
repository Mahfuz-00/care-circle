<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AppointmentType;
use App\Enums\DoseStatus;
use App\Enums\MedicationFrequency;
use App\Enums\MemberRole;
use App\Enums\MemberStatus;
use App\Enums\PlanCode;
use App\Models\Appointment;
use App\Models\CareCircle;
use App\Models\CareCircleMember;
use App\Models\Medication;
use App\Models\MedicationDose;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * A working demo of the core loop: a senior, her care circle, her
     * medications (one running low), today's doses and an upcoming appointment.
     *
     * Seeding runs on the owner connection, which is BYPASSRLS — the runtime role
     * is never used to load fixture data.
     */
    public function run(): void
    {
        $this->call(PlanSeeder::class);

        // The platform operator. Not a member of any care circle.
        User::updateOrCreate(
            ['email' => 'operator@carecircle.test'],
            [
                'name' => 'Platform Operator',
                'password' => Hash::make('password'),
                'timezone' => 'UTC',
                'is_platform_admin' => true,
            ],
        );

        $senior = User::updateOrCreate(
            ['email' => 'margaret@carecircle.test'],
            [
                'name' => 'Margaret Hill',
                'phone' => '+15550000001',
                'phone_verified_at' => now(),
                'password' => Hash::make('password'),
                'timezone' => 'Europe/London',
            ],
        );

        $primary = User::updateOrCreate(
            ['email' => 'sarah@carecircle.test'],
            [
                'name' => 'Sarah Hill',
                'phone' => '+15550000002',
                'phone_verified_at' => now(),
                'password' => Hash::make('password'),
                'timezone' => 'Europe/London',
            ],
        );

        $secondary = User::updateOrCreate(
            ['email' => 'tom@carecircle.test'],
            [
                'name' => 'Tom Hill',
                'phone' => '+15550000003',
                'phone_verified_at' => now(),
                'password' => Hash::make('password'),
                'timezone' => 'Europe/London',
            ],
        );

        $circle = CareCircle::updateOrCreate(
            ['name' => "Margaret's care circle"],
            [
                'owner_user_id' => $primary->id,
                'plan_code' => PlanCode::Family,
                'timezone' => 'Europe/London',
                'quiet_hours_start' => '21:00',
                'quiet_hours_end' => '07:00',
            ],
        );

        foreach ([
            [$senior, MemberRole::Senior],
            [$primary, MemberRole::PrimaryCaregiver],
            [$secondary, MemberRole::Caregiver],
        ] as [$user, $role]) {
            CareCircleMember::updateOrCreate(
                ['care_circle_id' => $circle->id, 'user_id' => $user->id],
                [
                    'role' => $role,
                    'status' => MemberStatus::Active,
                    'accepted_at' => now(),
                    'receive_emergency_alerts' => $role !== MemberRole::Senior,
                    'voice_consent' => $role === MemberRole::PrimaryCaregiver,
                ],
            );
        }

        $metformin = Medication::updateOrCreate(
            ['care_circle_id' => $circle->id, 'name' => 'Metformin'],
            [
                'owner_user_id' => $senior->id,
                'dosage' => '500 mg',
                'form' => 'tablet',
                'frequency' => MedicationFrequency::Daily,
                'times' => ['08:00', '20:00'],
                'with_food' => true,
                'is_high_priority' => true,
                'stock_quantity' => 8,
                'units_per_dose' => 1,
                'low_stock_threshold' => 10,
                'refill_reminder_days' => 7,
                'pharmacy_name' => 'Hillside Pharmacy',
                'pharmacy_phone' => '+15550000099',
                'starts_on' => now()->subMonths(2),
                'is_active' => true,
            ],
        );

        Medication::updateOrCreate(
            ['care_circle_id' => $circle->id, 'name' => 'Atorvastatin'],
            [
                'owner_user_id' => $senior->id,
                'dosage' => '20 mg',
                'form' => 'tablet',
                'frequency' => MedicationFrequency::Daily,
                'times' => ['20:00'],
                'with_food' => false,
                'is_high_priority' => false,
                'stock_quantity' => 60,
                'units_per_dose' => 1,
                'low_stock_threshold' => 10,
                'starts_on' => now()->subMonth(),
                'is_active' => true,
            ],
        );

        // Today's doses: the morning one already taken, the evening one pending.
        MedicationDose::updateOrCreate(
            ['medication_id' => $metformin->id, 'scheduled_for' => now()->startOfDay()->addHours(8)],
            [
                'care_circle_id' => $circle->id,
                'status' => DoseStatus::Taken,
                'taken_at' => now()->startOfDay()->addHours(8)->addMinutes(4),
                'marked_by_user_id' => $senior->id,
            ],
        );

        MedicationDose::updateOrCreate(
            ['medication_id' => $metformin->id, 'scheduled_for' => now()->startOfDay()->addHours(20)],
            ['care_circle_id' => $circle->id, 'status' => DoseStatus::Pending],
        );

        Appointment::updateOrCreate(
            ['care_circle_id' => $circle->id, 'title' => 'Dr. Okafor — check-up'],
            [
                'owner_user_id' => $senior->id,
                'created_by_user_id' => $primary->id,
                'type' => AppointmentType::Doctor,
                'location' => 'Hillside Medical Centre',
                'starts_at' => now()->addDays(4)->setTime(10, 30),
                'notes' => 'Bring the medication list.',
                'shared_with_circle' => true,
                'reminder_offsets' => [1440, 60],
            ],
        );
    }
}
