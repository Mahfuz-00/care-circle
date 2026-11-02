<?php

declare(strict_types=1);

namespace App\Services\Escalation;

use Carbon\CarbonInterface;

/**
 * Every fact a gate needs, gathered once. The policy is a pure function of this
 * object, which makes each gate trivially testable.
 */
final readonly class EscalationContext
{
    public function __construct(
        public string $subjectType,
        public int $subjectId,
        public bool $isEmergency,
        public bool $isHighPriority,
        public bool $isOverdue,
        public bool $isStillActive,
        public bool $recipientConsents,
        public bool $recipientHasVerifiedNumber,
        public bool $withinQuietHours,
        public bool $isVoiceChannel,
        public int $attemptsSoFar,
        public ?CarbonInterface $lastSentAt,
        public int $sentTodayForCircle,
    ) {}
}
