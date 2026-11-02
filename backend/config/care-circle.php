<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| CareCircle product configuration
|--------------------------------------------------------------------------
*/

return [

    /*
    | PRD §7 — the escalation policy. Default behaviour is deliberately
    | non-aggressive; every gate must pass before a call or notification is placed.
    */
    'escalation' => [
        'max_attempts_per_subject' => (int) env('ESCALATION_MAX_ATTEMPTS', 3),
        'cooldown_minutes' => (int) env('ESCALATION_COOLDOWN_MINUTES', 30),
        'daily_call_budget' => (int) env('ESCALATION_DAILY_CALL_BUDGET', 5),
        'default_channel_chain' => ['push', 'sms', 'voice'],
    ],

    /*
    | PRD §5.1 — stock and refill behaviour.
    */
    'stock' => [
        'default_low_stock_threshold' => 5,
        'default_refill_reminder_days' => 7,
    ],

    /*
    | PRD §8 — plan caps. Values mirror PlanCode::limits(); the enum is the
    | source of truth and these exist so limits can be tuned without a deploy.
    */
    'plans' => [
        'starter' => ['seats' => 2, 'medications' => 5, 'voice_minutes' => 0],
        'family' => ['seats' => 5, 'medications' => 20, 'voice_minutes' => 60],
        'care_pro' => ['seats' => 10, 'medications' => null, 'voice_minutes' => 300],
        'enterprise' => ['seats' => null, 'medications' => null, 'voice_minutes' => null],
    ],

    /*
    | PRD §9 — "Nothing is reported that was not measured." A check that cannot
    | run reports `fail`; a backup with no dump tool reports `skipped`.
    */
    'health' => [
        'dump_binary' => env('BACKUP_DUMP_BINARY', 'pg_dump'),
        'backup_freshness_hours' => (int) env('BACKUP_FRESHNESS_HOURS', 26),
    ],

    /*
    | The provider seam for push / SMS / voice. The log implementation is the
    | default; tests bind the fake.
    */
    'channels' => [
        'default' => env('CHANNEL_DRIVER', 'log'),
    ],
];
