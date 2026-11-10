<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CareCircle;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

class PlatformOperationsTest extends TestCase
{
    use BuildsCareCircles, RefreshDatabase;

    private User $operator;
    private string $operatorToken;

    private User $standardUser;
    private string $standardToken;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create a platform operator user with platform.admin capability
        $this->operator = $this->makeUser([
            'is_platform_admin' => true,
        ]);
        $this->operatorToken = $this->operator->createToken('dashboard', ['dashboard', 'platform.admin'])->plainTextToken;

        // 2. Create a standard caregiver/self-user without platform rights
        $this->standardUser = $this->makeUser([
            'is_platform_admin' => false,
        ]);
        $this->standardToken = $this->standardUser->createToken('dashboard', ['dashboard'])->plainTextToken;
    }

    public function test_non_platform_admin_is_forbidden_from_platform_routes(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->standardToken}")
            ->getJson('/api/v1/platform/billing/invoices')
            ->assertForbidden();

        $this->withHeader('Authorization', "Bearer {$this->standardToken}")
            ->getJson('/api/v1/platform/settings/payment')
            ->assertForbidden();

        $this->withHeader('Authorization', "Bearer {$this->standardToken}")
            ->getJson('/api/v1/platform/refunds')
            ->assertForbidden();
    }

    public function test_operator_can_view_and_manage_payment_gateways(): void
    {
        $res = $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->getJson('/api/v1/platform/settings/payment')
            ->assertOk();

        $res->assertJsonStructure(['data' => ['active_gateway', 'mode', 'currency', 'gateways']]);

        // Test connection ping
        $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->postJson('/api/v1/platform/settings/payment/test', [
                'gateway' => 'stripe',
                'mode' => 'sandbox',
            ])
            ->assertOk()
            ->assertJsonPath('status', 'ok');
    }

    public function test_operator_can_view_and_test_email_settings(): void
    {
        $res = $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->getJson('/api/v1/platform/settings/email')
            ->assertOk();

        $res->assertJsonStructure(['data' => ['mailer', 'host', 'port', 'templates']]);

        // Test email dispatch
        $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->postJson('/api/v1/platform/settings/email/test', [
                'recipient' => 'admin@carecircle.app',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_operator_can_approve_cash_settlement_and_upgrade_household(): void
    {
        $circleData = $this->makeCircle(null, ['plan_code' => 'starter']);
        $circle = $circleData['circle'];

        $invoice = Invoice::create([
            'care_circle_id' => $circle->id,
            'invoice_number' => 'INV-TEST-001',
            'amount_cents' => 3900,
            'currency' => 'USD',
            'status' => 'pending',
            'plan_code' => 'family',
            'payment_method' => 'cash',
        ]);

        $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->postJson("/api/v1/platform/billing/invoices/{$invoice->id}/approve-cash")
            ->assertOk();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('care_circles', [
            'id' => $circle->id,
            'plan_code' => 'family',
        ]);
    }

    public function test_operator_can_triage_feedback_reports(): void
    {
        $report = \App\Models\FeedbackReport::create([
            'type' => 'bug',
            'priority' => 'high',
            'status' => 'new',
            'subject' => 'Dose reminder push delay',
            'body' => 'Notification arrived 5 minutes late',
        ]);

        $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->patchJson("/api/v1/platform/feedback/{$report->id}", [
                'status' => 'resolved',
                'priority' => 'normal',
                'resolution_note' => 'Fixed in FCM delivery channel queue.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');
    }

    public function test_operator_can_view_marketing_overview_and_promotions(): void
    {
        $res = $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->getJson('/api/v1/platform/marketing/overview')
            ->assertOk();

        $res->assertJsonStructure(['data' => ['total_leads', 'active_promotions']]);

        // Create coupon
        $this->withHeader('Authorization', "Bearer {$this->operatorToken}")
            ->postJson('/api/v1/platform/marketing/promotions', [
                'code' => 'SPRING2026',
                'description' => '20% off comprehensive plan',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'currency' => 'USD',
                'duration' => 'once',
                'max_redemptions' => 50,
            ])
            ->assertCreated();
    }
}
