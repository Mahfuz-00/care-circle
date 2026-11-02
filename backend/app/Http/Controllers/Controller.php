<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CareCircleMember;
use App\Models\User;
use App\Support\CareCircleContext;

abstract class Controller
{
    /**
     * The care circle the request is acting in, as resolved by
     * ResolveCareCircleContext from the X-Care-Circle header or the route.
     */
    protected function careCircleId(): int
    {
        $careCircleId = app(CareCircleContext::class)->currentCareCircleId();

        abort_if(
            $careCircleId === null,
            400,
            'No active care circle. Send an X-Care-Circle header or target a care circle route.',
        );

        return $careCircleId;
    }

    protected function actor(): User
    {
        $user = request()->user();

        abort_if($user === null, 401, 'Authentication is required.');

        return $user;
    }

    protected function membership(?int $careCircleId = null): CareCircleMember
    {
        $membership = $this->actor()->membershipFor($careCircleId ?? $this->careCircleId());

        abort_if($membership === null, 403, 'You do not have access to this care circle.');

        return $membership;
    }

    /**
     * Role capabilities come from config/roles.php — the single source of truth.
     * Nothing else in the application may hard-code what a role may do.
     */
    protected function requirePermission(string $permission, ?int $careCircleId = null): CareCircleMember
    {
        $membership = $this->membership($careCircleId);

        abort_unless(
            $membership->hasPermission($permission),
            403,
            'Your role in this care circle does not allow this action.',
        );

        return $membership;
    }
}
