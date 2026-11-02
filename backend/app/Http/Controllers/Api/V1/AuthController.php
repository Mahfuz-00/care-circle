<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Enums\MemberRole;
use App\Enums\MemberStatus;
use App\Enums\PlanCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\CareCircleResource;
use App\Http\Resources\UserResource;
use App\Models\CareCircle;
use App\Models\CareCircleMember;
use App\Models\User;
use App\Services\Auditing\AuditLogger;
use App\Support\CareCircleContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Authentication for the dashboard surface. Tokens minted here carry the
 * `dashboard` ability and are rejected by /mobile/v1.
 */
class AuthController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        [$user, $circle] = DB::transaction(function () use ($data) {
            // The users table carries no RLS, so the account can be created first.
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'timezone' => $data['timezone'] ?? 'UTC',
            ]);

            // Registration is unauthenticated, so the RLS context is established
            // explicitly: the new account may create the circle it owns, then join it.
            app(CareCircleContext::class)->apply(null, $user->id);

            $circle = CareCircle::create([
                'name' => $data['circle_name'] ?? $user->name."'s circle",
                'owner_user_id' => $user->id,
                'plan_code' => PlanCode::Starter,
                'timezone' => $data['timezone'] ?? 'UTC',
            ]);

            app(CareCircleContext::class)->apply($circle->id, $user->id);

            CareCircleMember::create([
                'care_circle_id' => $circle->id,
                'user_id' => $user->id,
                'role' => MemberRole::from($data['role']),
                'status' => MemberStatus::Active,
                'accepted_at' => now(),
            ]);

            return [$user, $circle];
        });

        $this->audit->log('auth.registered', $user, $circle->id, AuditLevel::Notice, subject: $user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $this->mintToken($user, $request, 'dashboard'),
                'care_circle' => new CareCircleResource($circle),
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if ($user === null || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $user->forceFill(['last_seen_at' => now()])->save();

        $this->audit->log('auth.login', $user, null, AuditLevel::Info, subject: $user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $this->mintToken($user, $request, 'dashboard'),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'care_circles' => CareCircleResource::collection(
                    CareCircle::query()->orderBy('id')->get()
                ),
                'active_care_circle' => ($circleId = app(CareCircleContext::class)->currentCareCircleId()) === null
                    ? null
                    : new CareCircleResource(CareCircle::find($circleId)),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->audit->log('auth.logout', $request->user(), null, AuditLevel::Info);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['data' => ['message' => 'Signed out.']]);
    }

    private function mintToken(User $user, Request $request, string $ability): string
    {
        $abilities = [$ability];

        // The landlord console requires `dashboard` AND `platform.admin` (PRD §3).
        // A platform operator's dashboard token carries both; nobody else gets the
        // second ability, and mobile never does.
        if ($ability === 'dashboard' && $user->isPlatformAdmin()) {
            $abilities[] = 'platform.admin';
        }

        return $user->createToken(
            $request->validated('device_name') ?? 'dashboard',
            $abilities,
        )->plainTextToken;
    }
}
