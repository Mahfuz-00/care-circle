<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EscalationChannel;
use App\Models\Concerns\BelongsToCareCircle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'care_circle_id', 'channel', 'target_user_id', 'target_address',
    'template', 'payload', 'provider', 'status', 'provider_message_id', 'error',
])]
class ChannelMessage extends Model
{
    use BelongsToCareCircle, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'channel' => EscalationChannel::class,
            'payload' => 'array',
        ];
    }
}
