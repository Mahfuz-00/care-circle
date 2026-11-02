<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Scheduled work
|--------------------------------------------------------------------------
|
| PRD §12 — "Redis + Laravel queues + scheduler". The heartbeat is what lets the
| health check honestly report whether the scheduler is actually running.
|
*/

Schedule::command('carecircle:generate-doses')->dailyAt('00:05');
Schedule::command('carecircle:escalate')->everyFiveMinutes();
Schedule::command('carecircle:health')->everyFiveMinutes();

Schedule::call(fn () => Cache::put('health:scheduler:heartbeat', now(), 3600))
    ->everyMinute()
    ->name('scheduler-heartbeat');
