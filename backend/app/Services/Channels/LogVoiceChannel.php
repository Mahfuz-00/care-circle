<?php

declare(strict_types=1);

namespace App\Services\Channels;

use App\Enums\EscalationChannel;

class LogVoiceChannel extends LogChannel
{
    public function channel(): EscalationChannel
    {
        return EscalationChannel::Voice;
    }
}
