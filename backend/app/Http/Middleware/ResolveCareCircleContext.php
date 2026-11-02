<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\CareCircleContext;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Puts the acting user and the active care circle into the session GUCs that
 * every RLS policy reads.
 *
 * Both values are written on every request — including when the circle is null —
 * so a request can never inherit the previous request's context from a recycled
 * connection. A null circle means every policy comparison is false and the
 * database returns zero rows.
 */
final class ResolveCareCircleContext
{
    public function __construct(private readonly CareCircleContext $context) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // The acting user first: membership lookups below are keyed on it.
        $this->context->apply(null, $user?->id);

        try {
            $circleId = $this->resolveCareCircleId($request, $user);

            if ($circleId !== null && $user === null) {
                abort(401, 'Authentication is required to select a care circle.');
            }

            if ($circleId !== null && $user->membershipFor($circleId) === null) {
                abort(403, 'You do not have access to this care circle.');
            }

            $this->context->apply($circleId, $user?->id);

            return $next($request);
        } finally {
            $this->context->forget();
        }
    }

    private function resolveCareCircleId(Request $request, $user): ?int
    {
        $explicit = $request->header('X-Care-Circle') ?? $request->route('careCircle');

        // A bound route model is as good as its key.
        if ($explicit instanceof Model) {
            $explicit = $explicit->getKey();
        }

        if ($explicit !== null && $explicit !== '') {
            return (int) $explicit;
        }

        if ($user === null) {
            return null;
        }

        // Default to the first active circle this user belongs to.
        return $user->memberships()
            ->where('status', 'active')
            ->orderBy('id')
            ->value('care_circle_id');
    }
}
