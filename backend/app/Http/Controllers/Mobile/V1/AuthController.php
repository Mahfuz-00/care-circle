<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile\V1;

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
 * The mobile surface mints `mobile` tokens only. They are rejected by /api/v1 —
 * and the landlord console is not reachable from here at all.
 */
class AuthController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        [$user, $circle] = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'timezone' => $data['timezone'] ?? 'UTC',
            ]);

            // Registration is unauthenticated; establish the RLS context explicitly
            // so the new account can create and join the circle it owns.
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

        $this->audit->log('auth.registered', $user, $circle->id, AuditLevel::Notice, ['surface' => 'mobile'], $user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $this->mintToken($user, $request),
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

        $this->audit->log('auth.login', $user, null, AuditLevel::Info, ['surface' => 'mobile'], $user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $this->mintToken($user, $request),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => new UserResource($request->user()),
                'care_circles' => CareCircleResource::collection(CareCircle::query()->orderBy('id')->get()),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->audit->log('auth.logout', $request->user(), null, AuditLevel::Info, ['surface' => 'mobile']);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['data' => ['message' => 'Signed out.']]);
    }

    private function mintToken(User $user, Request $request): string
    {
        return $user->createToken(
            $request->validated('device_name') ?? 'mobile',
            ['mobile'],
        )->plainTextToken;
    }
}
