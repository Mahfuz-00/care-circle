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
        Schema::create('care_circle_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role');
            $table->string('status')->default('active');
            $table->boolean('receive_emergency_alerts')->default(true);
            $table->boolean('voice_consent')->default(false);
            $table->timestamp('phone_verified_at')->nullable();
            $table->foreignId('invited_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['care_circle_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('care_circle_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('role');
            $table->string('token', 64)->unique();
            $table->foreignId('invited_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->index(['care_circle_id', 'email']);
        });

        $this->isolateCareCircles();
        $this->isolateByMembership('care_circle_members');
        $this->isolateInvitations();
    }

    public function down(): void
    {
        $this->removeIsolation('care_circle_invitations');
        $this->removeIsolation('care_circle_members');
        $this->removeIsolation('care_circles');
        Schema::dropIfExists('care_circle_invitations');
        Schema::dropIfExists('care_circle_members');
    }
};
