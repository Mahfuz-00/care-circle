<?php

declare(strict_types=1);

namespace App\Services\Channels;

use App\Enums\EscalationChannel;
use App\Enums\EscalationStatus;
use App\Services\Channels\Contracts\Channel;
use App\Services\Channels\Contracts\DeliveryResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The default provider: it records exactly what it would have sent and reports
 * success, so the whole escalation pipeline is exercisable without a real
 * FCM/APNs/Twilio account.
 */
abstract class LogChannel implements Channel
{
    abstract public function channel(): EscalationChannel;

    public function send(
        int $careCircleId,
        ?int $targetUserId,
        ?string $address,
        string $template,
        array $payload,
    ): DeliveryResult {
        $messageId = 'log_'.Str::lower(Str::random(20));

        // A plain INSERT, not `create()`: channel_messages is append-only, and the
        // escalation context may legitimately be absent in a system-initiated pass.
        DB::table('channel_messages')->insert([
            'care_circle_id' => $careCircleId,
            'channel' => $this->channel()->value,
            'target_user_id' => $targetUserId,
            'target_address' => $address,
            'template' => $template,
            'payload' => json_encode($payload),
            'provider' => 'log',
            'status' => EscalationStatus::Sent->value,
            'provider_message_id' => $messageId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DeliveryResult::sent($messageId);
    }
}
