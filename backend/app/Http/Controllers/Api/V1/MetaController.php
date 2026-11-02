<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * PRD §6 — the role matrix the dashboard renders is generated from the same
 * config the API enforces, so the two can never drift.
 */
class MetaController extends Controller
{
    public function roles(): JsonResponse
    {
        $matrix = collect(config('roles.roles'))
            ->map(fn (array $role, string $key) => [
                'key' => $key,
                'label' => $role['label'],
                'description' => $role['description'],
                'permissions' => $role['permissions'],
                'can_invite' => $role['can_invite'] ?? false,
            ])
            ->values();

        return response()->json([
            'data' => [
                'permissions' => config('roles.permissions'),
                'roles' => $matrix,
                'assignable' => config('roles.assignable'),
                'surfaces' => [
                    'dashboard' => 'api/v1',
                    'mobile' => 'mobile/v1',
                ],
            ],
        ]);
    }
}
