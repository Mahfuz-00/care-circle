<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Enums\MemberRole;
use App\Enums\MemberStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CareCircle\InviteMemberRequest;
use App\Http\Requests\CareCircle\StoreCareCircleRequest;
use App\Http\Requests\CareCircle\UpdateCareCircleRequest;
use App\Http\Requests\CareCircle\UpdateMemberRequest;
use App\Http\Resources\CareCircleResource;
use App\Http\Resources\InvitationResource;
use App\Http\Resources\MedicationResource;
use App\Http\Resources\MemberResource;
use App\Models\CareCircle;
use App\Models\CareCircleInvitation;
use App\Models\CareCircleMember;
use App\Models\Medication;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CareCircleController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        // RLS returns exactly the circles this user belongs to.
        $circles = CareCircle::query()->withCount(['members', 'medications'])->orderBy('id')->get();

        return response()->json(['data' => CareCircleResource::collection($circles)]);
    }

    public function store(StoreCareCircleRequest $request): JsonResponse
    {
        $circle = CareCircle::create([
            'name' => $request->validated('name'),
            'owner_user_id' => $this->actor()->id,
            'timezone' => $request->validated('timezone') ?? $this->actor()->timezone,
        ]);

        CareCircleMember::create([
            'care_circle_id' => $circle->id,
            'user_id' => $this->actor()->id,
            'role' => MemberRole::PrimaryCaregiver,
            'status' => MemberStatus::Active,
            'accepted_at' => now(),
        ]);

        $this->audit->log('care_circle.created', $this->actor(), $circle->id, AuditLevel::Notice, subject: $circle);

        return response()->json(['data' => new CareCircleResource($circle)], 201);
    }

    public function show(CareCircle $careCircle): JsonResponse
    {
        $this->requirePermission('manage_care_circle', $careCircle->id);

        return response()->json([
            'data' => new CareCircleResource($careCircle->loadCount(['members', 'medications'])),
        ]);
    }

    public function update(UpdateCareCircleRequest $request, CareCircle $careCircle): JsonResponse
    {
        $this->requirePermission('manage_care_circle', $careCircle->id);

        $careCircle->update($request->validated());

        $this->audit->log('care_circle.updated', $this->actor(), $careCircle->id, AuditLevel::Notice, $request->validated(), $careCircle);

        return response()->json(['data' => new CareCircleResource($careCircle)]);
    }

    public function members(CareCircle $careCircle): JsonResponse
    {
        $this->membership($careCircle->id);

        $members = $careCircle->members()->with('user')->orderBy('id')->get();

        // PRD §5.3 — "A senior can always see who has access."
        return response()->json(['data' => MemberResource::collection($members)]);
    }

    public function invite(InviteMemberRequest $request, CareCircle $careCircle): JsonResponse
    {
        $membership = $this->membership($careCircle->id);

        // A senior may invite; only a circle manager may invite anyone.
        abort_unless(
            $membership->hasPermission('manage_care_circle') || $membership->role->value === 'senior',
            403,
            'Your role does not allow inviting members.',
        );

        $this->assertSeatAvailable($careCircle);

        $invitation = CareCircleInvitation::create([
            'care_circle_id' => $careCircle->id,
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'role' => $request->validated('role'),
            'invited_by_user_id' => $this->actor()->id,
        ]);

        $this->audit->log('care_circle.member_invited', $this->actor(), $careCircle->id, AuditLevel::Notice, [
            'email' => $invitation->email,
            'role' => $invitation->role->value,
        ], $invitation);

        return response()->json(['data' => new InvitationResource($invitation)], 201);
    }

    public function updateMember(UpdateMemberRequest $request, CareCircle $careCircle, CareCircleMember $member): JsonResponse
    {
        $this->requirePermission('manage_care_circle', $careCircle->id);

        abort_unless($member->care_circle_id === $careCircle->id, 404);

        $member->update($request->validated());

        $this->audit->log('care_circle.member_updated', $this->actor(), $careCircle->id, AuditLevel::Warning, [
            'member_id' => $member->id,
            'changes' => $request->validated(),
        ], $member);

        return response()->json(['data' => new MemberResource($member->load('user'))]);
    }

    public function removeMember(CareCircle $careCircle, CareCircleMember $member): JsonResponse
    {
        $this->requirePermission('manage_care_circle', $careCircle->id);

        abort_unless($member->care_circle_id === $careCircle->id, 404);
        abort_if($member->user_id === $careCircle->owner_user_id, 422, 'The care circle owner cannot be removed.');

        $member->update(['status' => MemberStatus::Removed]);

        $this->audit->log('care_circle.member_removed', $this->actor(), $careCircle->id, AuditLevel::Warning, [
            'member_id' => $member->id,
        ], $member);

        return response()->json(['data' => ['message' => 'Member removed.']]);
    }

    /**
     * PRD §5.3 — the senior can always see who has access, and to which medications.
     */
    public function sharedMedications(CareCircle $careCircle, Request $request): JsonResponse
    {
        $this->membership($careCircle->id);

        $medications = Medication::query()
            ->with('owner')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => MedicationResource::collection($medications)]);
    }

    private function assertSeatAvailable(CareCircle $careCircle): void
    {
        $limit = $careCircle->seatLimit();

        if ($limit === null) {
            return;
        }

        $seats = $careCircle->members()
            ->whereIn('status', [MemberStatus::Active->value, MemberStatus::Invited->value])
            ->count();

        abort_if($seats >= $limit, 422, "Your plan allows {$limit} care circle seats.");
    }
}
