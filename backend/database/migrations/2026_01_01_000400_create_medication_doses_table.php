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
        Schema::create('medication_doses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
            $table->foreignId('medication_id')->constrained('medications')->cascadeOnDelete();

            $table->timestamp('scheduled_for');
            $table->string('status')->default('pending');

            $table->timestamp('taken_at')->nullable();
            $table->foreignId('marked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('confirmation_photo_path')->nullable();
            $table->string('skip_reason')->nullable();
            $table->timestamp('snoozed_until')->nullable();
            $table->unsignedSmallInteger('snooze_count')->default(0);

            $table->timestamps();

            $table->unique(['medication_id', 'scheduled_for']);
            $table->index(['care_circle_id', 'scheduled_for', 'status']);
        });

        $this->isolate('medication_doses');
    }

    public function down(): void
    {
        $this->removeIsolation('medication_doses');
        Schema::dropIfExists('medication_doses');
    }
};
