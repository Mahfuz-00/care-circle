<?php

declare(strict_types=1);

namespace App\Enums;

enum EscalationChannel: string
{
    case InApp = 'in_app';
    case Push = 'push';
    case Sms = 'sms';
    case Voice = 'voice';

    public function label(): string
    {
        return match ($this) {
            self::InApp => 'In-app',
            self::Push => 'Push',
            self::Sms => 'SMS',
            self::Voice => 'Voice call',
        };
    }
}
