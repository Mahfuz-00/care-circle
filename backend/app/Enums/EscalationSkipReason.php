<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The exact reason an escalation action was skipped. PRD §7: "Skipped actions
 * are recorded with the reason. A skipped call is information."
 */
enum EscalationSkipReason: string
{
    case NotOverdue = 'not_overdue';
    case NotHighPriority = 'not_high_priority';
    case NoConsent = 'no_consent';
    case UnverifiedNumber = 'unverified_number';
    case QuietHours = 'quiet_hours';
    case AttemptLimitReached = 'attempt_limit_reached';
    case CooldownActive = 'cooldown_active';
    case BudgetExhausted = 'budget_exhausted';
    case SubjectNoLongerActive = 'subject_no_longer_active';
    case NoReachableRecipient = 'no_reachable_recipient';

    public function label(): string
    {
        return match ($this) {
            self::NotOverdue => 'The dose is not overdue yet',
            self::NotHighPriority => 'Not a high-priority medication or emergency',
            self::NoConsent => 'The recipient has not opted in',
            self::UnverifiedNumber => 'The recipient phone number is not verified',
            self::QuietHours => 'Inside the configured quiet hours',
            self::AttemptLimitReached => 'The attempt limit for this item is reached',
            self::CooldownActive => 'The minimum gap between attempts has not elapsed',
            self::BudgetExhausted => 'The daily call budget is exhausted',
            self::SubjectNoLongerActive => 'The item is no longer active',
            self::NoReachableRecipient => 'No caregiver could be reached',
        };
    }
}
