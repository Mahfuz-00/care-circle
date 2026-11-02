<?php

declare(strict_types=1);

namespace App\Services\Channels;

use App\Enums\EscalationChannel;

class LogSmsChannel extends LogChannel
{
    public function channel(): EscalationChannel
    {
        return EscalationChannel::Sms;
    }
}
