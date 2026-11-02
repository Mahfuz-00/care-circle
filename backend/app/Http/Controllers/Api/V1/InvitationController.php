<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\AuditLevel;
use App\Enums\MemberStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvitationResource;
use App\Models\CareCircleInvitation;
use App\Models\CareCircleMember;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(string $token): JsonResponse
    {
        $invitation = CareCircleInvitation::where('token', $token)->firstOrFail();

        abort_unless($invitation->isPending(), 410, 'This invitation is no longer valid.');

        return response()->json(['data' => new InvitationResource($invitation)]);
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $invitation = CareCircleInvitation::where('token', $token)->firstOrFail();

        abort_unless($invitation->isPending(), 410, 'This invitation is no longer valid.');

        $user = $this->actor();

        // The invitation policy lets a user read invitations addressed to their
        // own email; accepting anything else is refused.
        abort_unless($invitation->email === null || $invitation->email === $user->email, 403, 'This invitation is not addressed to you.');

        $member = CareCircleMember::updateOrCreate(
            ['care_circle_id' => $invitation->care_circle_id, 'user_id' => $user->id],
            [
                'role' => $invitation->role,
                'status' => MemberStatus::Active,
                'invited_by_user_id' => $invitation->invited_by_user_id,
                'accepted_at' => now(),
            ],
        );

        $invitation->update(['accepted_at' => now()]);

        $this->audit->log('care_circle.invitation_accepted', $user, $invitation->care_circle_id, AuditLevel::Notice, [
            'invitation_id' => $invitation->id,
        ], $member);

        return response()->json(['data' => ['care_circle_id' => $invitation->care_circle_id, 'role' => $member->role->value]]);
    }
}
