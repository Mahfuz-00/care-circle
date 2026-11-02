<?php

declare(strict_types=1);

namespace App\Enums;

enum MemberRole: string
{
    case SelfUser = 'self_user';
    case Senior = 'senior';
    case PrimaryCaregiver = 'primary_caregiver';
    case Caregiver = 'caregiver';

    public function label(): string
    {
        return match ($this) {
            self::SelfUser => 'Self-user',
            self::Senior => 'Senior',
            self::PrimaryCaregiver => 'Primary Caregiver',
            self::Caregiver => 'Caregiver',
        };
    }

    /** The role a care circle is created around. */
    public function isSubject(): bool
    {
        return $this === self::SelfUser || $this === self::Senior;
    }

    public function isCaregiver(): bool
    {
        return $this === self::PrimaryCaregiver || $this === self::Caregiver;
    }
}
