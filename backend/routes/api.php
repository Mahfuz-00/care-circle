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
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\Platform\AuditLogController;
use App\Http\Controllers\Api\V1\Platform\BackupController;
use App\Http\Controllers\Api\V1\Platform\BillingController;
use App\Http\Controllers\Api\V1\Platform\ClientController;
use App\Http\Controllers\Api\V1\Platform\EmailSettingController;
use App\Http\Controllers\Api\V1\Platform\FailedJobController;
use App\Http\Controllers\Api\V1\Platform\FeedbackController;
use App\Http\Controllers\Api\V1\Platform\HealthController;
use App\Http\Controllers\Api\V1\Platform\MarketingController;
use App\Http\Controllers\Api\V1\Platform\MetricController;
use App\Http\Controllers\Api\V1\Platform\PaymentSettingController;
use App\Http\Controllers\Api\V1\Platform\RefundController;
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
    /*
     * Public by design: the plan catalogue the marketing page renders (PRD §8).
     * It is read from the plans table, so the pricing on the page cannot drift
     * from the limits this API enforces. It exposes no tenant data.
     */
    Route::get('plans', [PlanController::class, 'index']);

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
                Route::post('system-health/cache/clear', [HealthController::class, 'clearCache']);
                Route::get('backups', [BackupController::class, 'index']);

                Route::get('failed-jobs', [FailedJobController::class, 'index']);
                Route::post('failed-jobs/retry-all', [FailedJobController::class, 'retryAll']);
                Route::post('failed-jobs/{id}/retry', [FailedJobController::class, 'retry']);
                Route::post('failed-jobs/flush', [FailedJobController::class, 'flush']);

                Route::get('audit-log', [AuditLogController::class, 'index']);
                Route::get('metrics', [MetricController::class, 'index']);

                // Clients / Households Module
                Route::get('clients/export', [ClientController::class, 'exportCsv']);
                Route::post('clients/bulk/suspend', [ClientController::class, 'bulkSuspend']);
                Route::post('clients/bulk/activate', [ClientController::class, 'bulkActivate']);
                Route::get('clients', [ClientController::class, 'index']);
                Route::get('clients/{id}', [ClientController::class, 'show']);
                Route::patch('clients/{id}', [ClientController::class, 'update']);
                Route::post('clients/{id}/suspend', [ClientController::class, 'suspend']);
                Route::post('clients/{id}/activate', [ClientController::class, 'activate']);

                // Invoices & Billing
                Route::get('billing/invoices', [BillingController::class, 'index']);
                Route::get('billing/invoices/{id}/download', [BillingController::class, 'downloadHtml']);
                Route::get('billing/pending-cash', [BillingController::class, 'pendingCash']);
                Route::post('billing/invoices/{id}/approve-cash', [BillingController::class, 'approveCash']);
                Route::post('billing/invoices/{id}/reject-cash', [BillingController::class, 'rejectCash']);

                // Payment Gateways
                Route::get('settings/payment', [PaymentSettingController::class, 'show']);
                Route::post('settings/payment', [PaymentSettingController::class, 'update']);
                Route::post('settings/payment/test', [PaymentSettingController::class, 'test']);

                // Email Settings
                Route::get('settings/email', [EmailSettingController::class, 'show']);
                Route::post('settings/email', [EmailSettingController::class, 'update']);
                Route::post('settings/email/test', [EmailSettingController::class, 'test']);

                // Refund Policy & Requests
                Route::get('refunds', [RefundController::class, 'index']);
                Route::post('refunds/policy', [RefundController::class, 'updatePolicy']);
                Route::post('refunds/eligibility', [RefundController::class, 'checkEligibility']);
                Route::post('refunds/{id}/approve', [RefundController::class, 'approve']);
                Route::post('refunds/{id}/reject', [RefundController::class, 'reject']);

                // Feedback Triage
                Route::get('feedback', [FeedbackController::class, 'index']);
                Route::patch('feedback/{id}', [FeedbackController::class, 'update']);

                // Marketing
                Route::get('marketing/overview', [MarketingController::class, 'overview']);
                Route::get('marketing/promotions', [MarketingController::class, 'promotions']);
                Route::post('marketing/promotions', [MarketingController::class, 'storePromotion']);
                Route::post('marketing/promotions/{id}/toggle', [MarketingController::class, 'togglePromotion']);
                Route::get('marketing/announcements', [MarketingController::class, 'announcements']);
                Route::post('marketing/announcements', [MarketingController::class, 'storeAnnouncement']);
                Route::post('marketing/announcements/{id}/toggle', [MarketingController::class, 'toggleAnnouncement']);
                Route::get('marketing/leads', [MarketingController::class, 'leads']);
                Route::patch('marketing/leads/{id}', [MarketingController::class, 'updateLead']);
            });
    });
});
