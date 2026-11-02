<?php

declare(strict_types=1);

namespace App\Services\Channels\Contracts;

use App\Enums\EscalationChannel;

/**
 * A delivery provider seam. Push (FCM/APNs), SMS and voice each sit behind this
 * interface so the real provider can be swapped in without touching the
 * escalation logic — and so tests never touch a real provider.
 */
interface Channel
{
    public function channel(): EscalationChannel;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function send(
        int $careCircleId,
        ?int $targetUserId,
        ?string $address,
        string $template,
        array $payload,
    ): DeliveryResult;
}
