<?php

declare(strict_types=1);

namespace App\Services\Channels;

use App\Enums\EscalationChannel;
use App\Services\Channels\Contracts\Channel;

/**
 * Resolves the implementation behind each channel. Swapping `log` for a real
 * provider is a binding change here, nothing more.
 */
final class ChannelManager
{
    /** @param array<string, Channel> $channels */
    public function __construct(private readonly array $channels) {}

    public function for(EscalationChannel $channel): Channel
    {
        if (! isset($this->channels[$channel->value])) {
            throw new \RuntimeException("No channel implementation registered for [{$channel->value}].");
        }

        return $this->channels[$channel->value];
    }

    /** @return list<Channel> */
    public function chain(): array
    {
        return array_values($this->channels);
    }
}
