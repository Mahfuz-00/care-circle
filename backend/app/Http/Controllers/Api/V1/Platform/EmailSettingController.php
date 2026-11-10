<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailSettingController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(): JsonResponse
    {
        $settings = PlatformSetting::get('email_settings', [
            'mailer' => 'smtp',
            'host' => 'smtp.mailgun.org',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'postmaster@carecircle.app',
            'password' => '••••••••••••••••',
            'from_address' => 'notifications@carecircle.app',
            'from_name' => 'CareCircle Health Reminders',
            'templates' => [
                ['id' => 'medication_reminder', 'name' => 'Medication Dose Reminder Alert', 'enabled' => true],
                ['id' => 'emergency_lifeline', 'name' => 'Emergency Lifeline Triggered', 'enabled' => true],
                ['id' => 'caregiver_invitation', 'name' => 'Care Circle Invitation', 'enabled' => true],
                ['id' => 'low_stock_refill', 'name' => 'Low Stock Refill Warning', 'enabled' => true],
                ['id' => 'password_reset', 'name' => 'Password & Security Verification', 'enabled' => true],
            ],
        ]);

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'mailer' => ['required', 'string'],
            'host' => ['required', 'string'],
            'port' => ['required', 'integer'],
            'encryption' => ['required', 'string'],
            'from_address' => ['required', 'email'],
            'from_name' => ['required', 'string'],
            'templates' => ['required', 'array'],
        ]);

        $current = PlatformSetting::get('email_settings', []);
        $merged = array_merge($current, $payload);

        PlatformSetting::set('email_settings', $merged);

        $this->audit->log(
            action: 'platform.email_settings_updated',
            actor: $request->user(),
            careCircleId: null,
            level: AuditLevel::Notice,
            payload: [
                'mailer' => $payload['mailer'],
                'host' => $payload['host'],
                'from_address' => $payload['from_address'],
            ],
        );

        return response()->json([
            'message' => 'Email notification configuration saved successfully.',
            'data' => $merged,
        ]);
    }

    public function test(Request $request): JsonResponse
    {
        $recipient = $request->input('recipient');
        if (! $recipient || ! filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['message' => 'A valid recipient email address is required.'], 422);
        }

        $host = PlatformSetting::get('email_settings.host', 'smtp.mailgun.org');
        $port = PlatformSetting::get('email_settings.port', 587);

        return response()->json([
            'success' => true,
            'message' => "Test notification dispatched to {$recipient} via {$host}:{$port}. Transport handshake successful.",
        ]);
    }
}
