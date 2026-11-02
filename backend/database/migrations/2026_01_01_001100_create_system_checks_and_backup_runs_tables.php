<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Platform-wide operational tables. These are not tenant scoped — they are
     * what the landlord console reads (PRD §10), and they carry no care-circle
     * data, so they need no RLS policy.
     */
    public function up(): void
    {
        Schema::create('system_checks', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('status');
            $table->string('message')->nullable();
            $table->jsonb('meta')->default('{}');
            $table->timestamp('measured_at');
            $table->timestamps();

            $table->index(['key', 'measured_at']);
        });

        Schema::create('backup_runs', function (Blueprint $table) {
            $table->id();
            $table->string('status');
            $table->string('disk')->nullable();
            $table->string('path')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('message')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_runs');
        Schema::dropIfExists('system_checks');
    }
};
