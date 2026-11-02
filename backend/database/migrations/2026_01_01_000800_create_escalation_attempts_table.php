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
        // Every attempt — including every skip, with its reason. PRD §7.
        Schema::create('escalation_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();

            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id');

            $table->string('channel');
            $table->string('status');
            $table->string('reason')->nullable();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider_message_id')->nullable();
            $table->text('detail')->nullable();
            $table->timestamp('attempted_at');
            $table->timestamps();

            $table->index(['care_circle_id', 'subject_type', 'subject_id'], 'escalation_subject_index');
            $table->index(['care_circle_id', 'attempted_at']);
        });

        $this->isolate('escalation_attempts');
    }

    public function down(): void
    {
        $this->removeIsolation('escalation_attempts');
        Schema::dropIfExists('escalation_attempts');
    }
};
