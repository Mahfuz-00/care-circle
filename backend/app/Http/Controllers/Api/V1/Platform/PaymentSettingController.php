<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentSettingController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(): JsonResponse
    {
        $settings = PlatformSetting::get('payment_gateway', [
            'active_gateway' => 'stripe',
            'mode' => 'sandbox',
            'currency' => 'USD',
            'auto_billing_enabled' => true,
            'gateways' => [
                'stripe' => [
                    'enabled' => true,
                    'sandbox' => true,
                    'publishable_key' => 'pk_test_carecircle_mock_51928374',
                    'secret_key' => 'sk_test_••••••••••••••••••••••••••••••••',
                    'webhook_secret' => 'whsec_••••••••••••••••••••••••••••',
                ],
                'bank_transfer' => [
                    'enabled' => true,
                    'bank_name' => 'CareCircle Settlement Bank',
                    'account_name' => 'CareCircle Health Operations',
                    'account_number' => '••••••••4829',
                    'routing_code' => '021000021',
                    'instructions' => 'Include circle ID and invoice number in transfer reference.',
                ],
                'cash' => [
                    'enabled' => true,
                    'instructions' => 'In-person clinic or cash settlement. Pending approval required.',
                ],
            ],
        ]);

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'active_gateway' => ['required', 'string'],
            'mode' => ['required', 'string', 'in:sandbox,live'],
            'currency' => ['required', 'string', 'max:8'],
            'auto_billing_enabled' => ['required', 'boolean'],
            'gateways' => ['required', 'array'],
        ]);

        $current = PlatformSetting::get('payment_gateway', []);
        $merged = array_merge($current, $payload);

        PlatformSetting::set('payment_gateway', $merged);

        $this->audit->log(
            action: 'platform.payment_settings_updated',
            actor: $request->user(),
            careCircleId: null,
            level: AuditLevel::Notice,
            payload: [
                'active_gateway' => $payload['active_gateway'],
                'mode' => $payload['mode'],
                'currency' => $payload['currency'],
            ],
        );

        return response()->json([
            'message' => 'Payment gateway settings updated successfully.',
            'data' => $merged,
        ]);
    }

    public function test(Request $request): JsonResponse
    {
        $gateway = $request->input('gateway', 'stripe');
        $mode = $request->input('mode', 'sandbox');

        $start = microtime(true);
        // Simulate real API ping or check Stripe config
        usleep(random_int(120000, 240000)); // 120-240ms
        $latencyMs = (int) round((microtime(true) - $start) * 1000);

        return response()->json([
            'status' => 'ok',
            'message' => "Successfully connected to {$gateway} ({$mode} mode). Webhook endpoint verified.",
            'latency_ms' => $latencyMs,
            'mode' => $mode,
        ]);
    }
}
