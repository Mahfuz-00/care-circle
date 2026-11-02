<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Forces JSON negotiation on the API groups.
 *
 * Without this, an unauthenticated request that does not send
 * `Accept: application/json` makes Laravel's auth middleware try to redirect to a
 * `login` route — which does not exist in a token-only API — and the caller gets a
 * 500 instead of an honest 401.
 */
final class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
