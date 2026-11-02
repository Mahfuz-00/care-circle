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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->string('type')->default('doctor');
            $table->string('location')->nullable();
            $table->timestamp('starts_at');
            $table->text('notes')->nullable();
            $table->boolean('shared_with_circle')->default(true);
            $table->jsonb('reminder_offsets')->default('[1440, 60]');

            $table->timestamps();

            $table->index(['care_circle_id', 'starts_at']);
        });

        $this->isolate('appointments');
    }

    public function down(): void
    {
        $this->removeIsolation('appointments');
        Schema::dropIfExists('appointments');
    }
};
