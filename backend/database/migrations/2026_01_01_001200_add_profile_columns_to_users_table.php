<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            $table->string('timezone')->default('UTC')->after('password');
            $table->boolean('is_platform_admin')->default(false)->after('timezone');
            $table->timestamp('last_seen_at')->nullable()->after('is_platform_admin');
        });

        // The owner of every care circle is a user; the platform flag is an
        // operator concern, not a care-circle role (see config/roles.php).
        Schema::table('users', function (Blueprint $table) {
            $table->index('is_platform_admin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_platform_admin']);
            $table->dropColumn([
                'phone',
                'phone_verified_at',
                'timezone',
                'is_platform_admin',
                'last_seen_at',
            ]);
        });
    }
};
