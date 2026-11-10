<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Platform operations & business governance tables.
     * These tables serve landlord and platform administration.
     */
    public function up(): void
    {
        // 1. Add status and suspended_at to care_circles if not present
        if (! Schema::hasColumn('care_circles', 'status')) {
            Schema::table('care_circles', function (Blueprint $table) {
                $table->string('status', 32)->default('active')->index();
                $table->timestamp('suspended_at')->nullable();
            });
        }

        // 2. Global platform settings (system, email, payment gateways, etc.)
        if (! Schema::hasTable('platform_settings')) {
            Schema::create('platform_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key', 64)->unique();
                $table->jsonb('value');
                $table->timestamps();
            });
        }

        // 3. Billing & Invoices
        if (! Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
                $table->string('invoice_number', 64)->unique();
                $table->unsignedBigInteger('amount_cents');
                $table->string('currency', 3)->default('USD');
                $table->string('status', 32)->default('paid')->index(); // 'paid', 'pending', 'failed', 'refunded'
                $table->string('plan_code', 32)->default('starter');
                $table->string('billing_period', 32)->default('monthly');
                $table->timestamp('period_start')->nullable();
                $table->timestamp('period_end')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->string('payment_method', 64)->default('credit_card'); // 'credit_card', 'cash', 'bank_transfer'
                $table->string('last4', 4)->nullable();
                $table->jsonb('line_items')->nullable();
                $table->timestamps();
            });
        }

        // 4. Refund Requests & Policy Execution
        if (! Schema::hasTable('refund_requests')) {
            Schema::create('refund_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('care_circle_id')->nullable()->constrained('care_circles')->nullOnDelete();
                $table->string('care_circle_name');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('user_email')->nullable();
                $table->integer('amount_cents')->default(0);
                $table->string('currency', 8)->default('USD');
                $table->text('reason');
                $table->string('status', 32)->default('pending')->index(); // 'pending', 'approved', 'rejected'
                $table->text('admin_notes')->nullable();
                $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('processed_at')->nullable();
                $table->timestamps();
            });
        }

        // 5. Household Feedback & Clinical Incident Reports
        if (! Schema::hasTable('feedback_reports')) {
            Schema::create('feedback_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('care_circle_id')->nullable()->constrained('care_circles')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type', 32)->default('feedback'); // 'bug', 'feedback', 'feature_request'
                $table->string('priority', 32)->default('normal'); // 'low', 'normal', 'high', 'critical'
                $table->string('status', 32)->default('new')->index(); // 'new', 'triaged', 'in_progress', 'resolved', 'wont_fix'
                $table->string('subject');
                $table->text('body');
                $table->jsonb('context')->nullable();
                $table->text('resolution_note')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        // 6. Marketing Promotions (Coupons)
        if (! Schema::hasTable('marketing_promotions')) {
            Schema::create('marketing_promotions', function (Blueprint $table) {
                $table->id();
                $table->string('code', 32)->unique();
                $table->string('description')->nullable();
                $table->string('discount_type', 16)->default('percent'); // 'percent', 'fixed_amount'
                $table->integer('discount_value')->default(20);
                $table->string('currency', 8)->default('USD');
                $table->string('duration', 16)->default('once'); // 'once', 'repeating', 'forever'
                $table->integer('max_redemptions')->default(100);
                $table->integer('redeemed_count')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        // 7. Marketing In-App Announcements & Banners
        if (! Schema::hasTable('marketing_announcements')) {
            Schema::create('marketing_announcements', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('message');
                $table->string('cta_text')->nullable();
                $table->string('cta_url')->nullable();
                $table->string('tone', 16)->default('primary');
                $table->string('target_audience', 16)->default('all');
                $table->boolean('is_active')->default(true);
                $table->integer('impressions_count')->default(0);
                $table->integer('clicks_count')->default(0);
                $table->timestamps();
            });
        }

        // 8. Marketing Leads
        if (! Schema::hasTable('marketing_leads')) {
            Schema::create('marketing_leads', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email');
                $table->string('phone')->nullable();
                $table->string('status', 32)->default('new'); // 'new', 'contacted', 'converted', 'disqualified'
                $table->string('source')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Safely grant table permissions to the care_circle_app restricted role if on PostgreSQL
        if (config('database.default') === 'pgsql' || config('database.default') === 'pgsql_migrations') {
            DB::statement("
                DO \$\$
                BEGIN
                    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'care_circle_app') THEN
                        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE platform_settings, invoices, refund_requests, feedback_reports, marketing_promotions, marketing_announcements, marketing_leads TO care_circle_app;
                        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO care_circle_app;
                    END IF;
                END
                \$\$;
            ");
        }

        // Initial default seed for platform_settings if empty
        if (DB::table('platform_settings')->where('key', 'payment_gateway')->doesntExist()) {
            DB::table('platform_settings')->insert([
                'key' => 'payment_gateway',
                'value' => json_encode([
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
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (DB::table('platform_settings')->where('key', 'email_settings')->doesntExist()) {
            DB::table('platform_settings')->insert([
                'key' => 'email_settings',
                'value' => json_encode([
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
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (DB::table('platform_settings')->where('key', 'refund_policy')->doesntExist()) {
            DB::table('platform_settings')->insert([
                'key' => 'refund_policy',
                'value' => json_encode([
                    'policy_markdown' => "# CareCircle Subscription Refund Policy\n\nCareCircle provides complete care coordination and medication reminders for families. If you or your care circle are not satisfied with your plan:\n\n### 14-Day Full Satisfaction Guarantee\nAll new subscriptions can be refunded in full within 14 days of enrollment.\n\n### Pro-Rata Policy for Annual Subscriptions\nUnused calendar months on annual care circle plans are refunded pro-rata upon request.",
                    'refund_window_days' => 14,
                    'monthly_refund_percent' => 100,
                    'annual_refund_percent' => 85,
                    'auto_approve_under_cents' => 0,
                    'contact_email' => 'billing@carecircle.app',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_leads');
        Schema::dropIfExists('marketing_announcements');
        Schema::dropIfExists('marketing_promotions');
        Schema::dropIfExists('feedback_reports');
        Schema::dropIfExists('refund_requests');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('platform_settings');

        if (Schema::hasColumn('care_circles', 'status')) {
            Schema::table('care_circles', function (Blueprint $table) {
                $table->dropColumn(['status', 'suspended_at']);
            });
        }
    }
};
