<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdherenceController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CareCircleController;
use App\Http\Controllers\Api\V1\DoseController;
use App\Http\Controllers\Api\V1\EmergencyController;
use App\Http\Controllers\Api\V1\InvitationController;
use App\Http\Controllers\Api\V1\MedicationController;
use App\Http\Controllers\Api\V1\MetaController;
use App\Http\Controllers\Api\V1\Platform\AuditLogController;
use App\Http\Controllers\Api\V1\Platform\BackupController;
use App\Http\Controllers\Api\V1\Platform\FailedJobController;
use App\Http\Controllers\Api\V1\Platform\HealthController;
use App\Http\Controllers\Api\V1\Platform\MetricController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dashboard surface — /api/v1
|--------------------------------------------------------------------------
|
| PRD §3: this surface requires the `dashboard` ability. A token minted on the
| mobile surface is rejected here, and vice versa.
|
*/

Route::prefix('v1')->group(function () {
    // Unauthenticated: minting a token is how you get one.
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    /*
     * `care-circle` establishes the RLS session context for every authenticated
     * request — including ones that are not scoped to a single circle. Without it,
     * `auth/me` would ask "which circles am I in?" with no acting user and the
     * database would correctly answer "none".
     */
    Route::middleware(['auth:sanctum', 'abilities:dashboard', 'care-circle'])->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // The role matrix the dashboard renders — same config the API enforces.
        Route::get('meta/roles', [MetaController::class, 'roles']);

        Route::get('care-circles', [CareCircleController::class, 'index']);
        Route::post('care-circles', [CareCircleController::class, 'store']);
        Route::get('care-circles/{careCircle}', [CareCircleController::class, 'show']);
        Route::patch('care-circles/{careCircle}', [CareCircleController::class, 'update']);
        Route::get('care-circles/{careCircle}/members', [CareCircleController::class, 'members']);
        Route::post('care-circles/{careCircle}/invitations', [CareCircleController::class, 'invite']);
        Route::patch('care-circles/{careCircle}/members/{member}', [CareCircleController::class, 'updateMember']);
        Route::delete('care-circles/{careCircle}/members/{member}', [CareCircleController::class, 'removeMember']);
        Route::get('care-circles/{careCircle}/shared-medications', [CareCircleController::class, 'sharedMedications']);

        Route::get('invitations/{token}', [InvitationController::class, 'show']);
        Route::post('invitations/{token}/accept', [InvitationController::class, 'accept']);

        Route::get('medications', [MedicationController::class, 'index']);
        Route::post('medications', [MedicationController::class, 'store']);
        Route::get('medications/{medication}', [MedicationController::class, 'show']);
        Route::patch('medications/{medication}', [MedicationController::class, 'update']);
        Route::delete('medications/{medication}', [MedicationController::class, 'destroy']);
        Route::post('medications/{medication}/refill', [MedicationController::class, 'refill']);

        Route::get('doses/today', [DoseController::class, 'today']);
        Route::post('doses/{dose}/take', [DoseController::class, 'take']);
        Route::post('doses/{dose}/skip', [DoseController::class, 'skip']);
        Route::post('doses/{dose}/snooze', [DoseController::class, 'snooze']);

        Route::get('adherence', [AdherenceController::class, 'show']);

        Route::get('appointments', [AppointmentController::class, 'index']);
        Route::post('appointments', [AppointmentController::class, 'store']);
        Route::patch('appointments/{appointment}', [AppointmentController::class, 'update']);
        Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy']);

        Route::get('emergency', [EmergencyController::class, 'index']);
        Route::post('emergency', [EmergencyController::class, 'store']);
        Route::post('emergency/{alert}/acknowledge', [EmergencyController::class, 'acknowledge']);
        Route::post('emergency/{alert}/resolve', [EmergencyController::class, 'resolve']);
        Route::post('emergency/{alert}/cancel', [EmergencyController::class, 'cancel']);

        /*
         * The landlord console. Operator-only: it needs BOTH the platform.admin
         * token ability and the user flag, and it does not exist on the mobile
         * surface at all.
         */
        Route::prefix('platform')
            ->middleware(['abilities:dashboard,platform.admin', 'platform.admin'])
            ->group(function () {
                Route::get('system-health', [HealthController::class, 'index']);
                Route::get('backups', [BackupController::class, 'index']);
                Route::get('failed-jobs', [FailedJobController::class, 'index']);
                Route::get('audit-log', [AuditLogController::class, 'index']);
                Route::get('metrics', [MetricController::class, 'index']);
            });
    });
});
