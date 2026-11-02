<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Channels\ChannelManager;
use App\Services\Channels\LogPushChannel;
use App\Services\Channels\LogSmsChannel;
use App\Services\Channels\LogVoiceChannel;
use App\Services\Escalation\EscalationPolicy;
use App\Support\CareCircleContext;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CareCircleContext::class, fn () => new CareCircleContext);

        // PRD §12 — push (FCM/APNs), SMS and voice each sit behind an interface.
        // The log implementations are the default; swapping in a real provider is
        // a change here and nowhere else.
        $this->app->singleton(ChannelManager::class, fn () => new ChannelManager([
            'push' => new LogPushChannel,
            'sms' => new LogSmsChannel,
            'voice' => new LogVoiceChannel,
        ]));

        $this->app->singleton(EscalationPolicy::class, fn () => EscalationPolicy::fromConfig());
    }

    public function boot(): void
    {
        //
    }
}
