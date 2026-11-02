<?php

declare(strict_types=1);

namespace App\Services\Channels\Contracts;

use App\Enums\EscalationStatus;

final readonly class DeliveryResult
{
    public function __construct(
        public EscalationStatus $status,
        public ?string $providerMessageId = null,
        public ?string $error = null,
    ) {}

    public static function sent(string $providerMessageId): self
    {
        return new self(EscalationStatus::Sent, $providerMessageId);
    }

    public static function failed(string $error): self
    {
        return new self(EscalationStatus::Failed, error: $error);
    }
}
