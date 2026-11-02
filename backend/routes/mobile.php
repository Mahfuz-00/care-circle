<?php

declare(strict_types=1);

use App\Http\Controllers\Mobile\V1\AppointmentController;
use App\Http\Controllers\Mobile\V1\AuthController;
use App\Http\Controllers\Mobile\V1\CareCircleController;
use App\Http\Controllers\Mobile\V1\DoseController;
use App\Http\Controllers\Mobile\V1\EmergencyController;
use App\Http\Controllers\Mobile\V1\HomeController;
use App\Http\Controllers\Mobile\V1\MedicationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile surface — /mobile/v1
|--------------------------------------------------------------------------
|
| PRD §3: this surface requires the `mobile` ability, and the landlord console
| is deliberately absent here. A dashboard token is rejected by every route
| below.
|
*/

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'abilities:mobile', 'care-circle'])->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // One call on open: today's doses, upcoming appointments, the circle, alerts.
    Route::get('today', [HomeController::class, 'today']);

    Route::get('medications', [MedicationController::class, 'index']);
    Route::get('appointments', [AppointmentController::class, 'index']);
    Route::get('care-circle', [CareCircleController::class, 'show']);

    Route::post('doses/{dose}/take', [DoseController::class, 'take']);
    Route::post('doses/{dose}/skip', [DoseController::class, 'skip']);
    Route::post('doses/{dose}/snooze', [DoseController::class, 'snooze']);

    Route::post('emergency', [EmergencyController::class, 'store']);
    Route::get('emergency/{alert}', [EmergencyController::class, 'show']);
    Route::post('emergency/{alert}/acknowledge', [EmergencyController::class, 'acknowledge']);
});
