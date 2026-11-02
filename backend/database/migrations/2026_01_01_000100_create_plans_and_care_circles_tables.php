<?php

declare(strict_types=1);

use App\Support\Migrations\Concerns\IsolatesByCareCircle;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use IsolatesByCareCircle;

    public function up(): void
    {
        // PRD §8 — the plan catalogue. Global, not tenant scoped.
        Schema::create('plans', function (Blueprint $table) {
            $table->string('code')->primary();
            $table->string('name');
            $table->unsignedSmallInteger('seats')->nullable();
            $table->unsignedInteger('medications')->nullable();
            $table->unsignedInteger('voice_minutes')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('care_circles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('plan_code')->default('starter');
            $table->string('timezone')->default('UTC');
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->timestamps();

            $table->foreign('plan_code')->references('code')->on('plans');
        });

        // The care_circles policy references care_circle_members, so it is applied
        // in the next migration once that table exists.
    }

    public function down(): void
    {
        Schema::dropIfExists('care_circles');
        Schema::dropIfExists('plans');
    }
};
