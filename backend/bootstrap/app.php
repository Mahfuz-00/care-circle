<?php

declare(strict_types=1);

use App\Http\Middleware\EnsurePlatformAdmin;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\ResolveCareCircleContext;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // The second client surface. Same application, different prefix and
        // different Sanctum ability (PRD §3).
        then: function () {
            Route::middleware('api')
                ->prefix('mobile/v1')
                ->name('mobile.')
                ->group(base_path('routes/mobile.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Both client surfaces are JSON APIs; a rejected request must answer 401/403
        // rather than attempt a redirect to a web login route.
        $middleware->api(prepend: [ForceJsonResponse::class]);

        /*
         * Order matters, and the default order is wrong for us.
         *
         * Route-model binding resolves `{medication}`, `{careCircle}` and friends
         * by querying the database — and every one of those tables is behind RLS.
         * If binding runs before the care-circle context exists, the row is
         * invisible and the request 404s. So the sequence must be:
         *
         *     authenticate  →  resolve care-circle context  →  bind models
         */
        $middleware->prependToPriorityList(
            before: SubstituteBindings::class,
            prepend: ResolveCareCircleContext::class,
        );

        $middleware->prependToPriorityList(
            before: ResolveCareCircleContext::class,
            prepend: Authenticate::class,
        );

        $middleware->alias([
            'care-circle' => ResolveCareCircleContext::class,
            'platform.admin' => EnsurePlatformAdmin::class,
            // Sanctum ships these middleware but registers no aliases for them.
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->is('mobile/*') || $request->expectsJson(),
        );
    })->create();
