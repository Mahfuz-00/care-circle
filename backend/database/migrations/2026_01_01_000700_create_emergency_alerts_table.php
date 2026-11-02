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
        Schema::create('emergency_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
            $table->foreignId('raised_by_user_id')->constrained('users')->cascadeOnDelete();

            $table->string('type');
            $table->string('status')->default('open');

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_label')->nullable();
            $table->text('note')->nullable();

            $table->foreignId('acknowledged_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['care_circle_id', 'status']);
        });

        $this->isolate('emergency_alerts');
    }

    public function down(): void
    {
        $this->removeIsolation('emergency_alerts');
        Schema::dropIfExists('emergency_alerts');
    }
};
