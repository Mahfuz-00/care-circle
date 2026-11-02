<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Roles & Permissions — the single source of truth
|--------------------------------------------------------------------------
|
| PRD §6: "Roles are declared once (config/roles.php style) and both API
| enforcement and the dashboard matrix are generated from that single source."
|
| Nothing else in the application may hard-code a role's capabilities.
|
*/

return [

    /*
    | Permissions a role may hold. The keys are the columns of the PRD §6 matrix.
    */
    'permissions' => [
        'manage_own_medications' => 'Add and edit their own medications',
        'view_circle_medications' => 'See every medication in the care circle',
        'edit_circle_medications' => 'Edit medications that belong to someone else',
        'mark_doses' => 'Mark a dose taken, skipped or snoozed',
        'receive_emergency' => 'Be alerted when the care circle raises an emergency',
        'manage_care_circle' => 'Invite, change and remove care circle members',
    ],

    /*
    | The role matrix. Order is the order shown in the dashboard.
    */
    'roles' => [

        'self_user' => [
            'label' => 'Self-user',
            'description' => 'An adult managing their own medications.',
            'permissions' => [
                'manage_own_medications',
                'mark_doses',
            ],
        ],

        'senior' => [
            'label' => 'Senior',
            'description' => 'The person at the centre of a care circle.',
            'permissions' => [
                'manage_own_medications',
                'mark_doses',
            ],
            // PRD §6: a senior may invite, but does not manage the circle.
            'can_invite' => true,
        ],

        'primary_caregiver' => [
            'label' => 'Primary Caregiver',
            'description' => 'The adult child or main caretaker. Manages the circle.',
            'permissions' => [
                'manage_own_medications',
                'view_circle_medications',
                'edit_circle_medications',
                'mark_doses',
                'receive_emergency',
                'manage_care_circle',
            ],
        ],

        'caregiver' => [
            'label' => 'Caregiver',
            'description' => 'A secondary caregiver or family member.',
            'permissions' => [
                'manage_own_medications',
                'view_circle_medications',
                'mark_doses',
                'receive_emergency',
            ],
        ],

    ],

    /*
    | Roles that may be granted to a member of a care circle. `platform_admin`
    | is deliberately not here — it is an operator flag, not a circle role.
    */
    'assignable' => [
        'senior',
        'primary_caregiver',
        'caregiver',
    ],

];
