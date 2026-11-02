<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * PRD §3 — the landlord console is operator-only. It requires the `dashboard`
 * ability *and* the platform admin flag, and it does not exist on mobile.
 */
final class EnsurePlatformAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->isPlatformAdmin()) {
            abort(403, 'The platform console is restricted to platform operators.');
        }

        return $next($request);
    }
}
