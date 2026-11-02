<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * PRD §9: "Health checks that cannot run report `fail`; backups with no dump
 * tool report `skipped`." Nothing is reported that was not measured.
 */
enum CheckStatus: string
{
    case Ok = 'ok';
    case Warn = 'warn';
    case Fail = 'fail';
    case Skipped = 'skipped';

    public function isHealthy(): bool
    {
        return $this === self::Ok;
    }
}
