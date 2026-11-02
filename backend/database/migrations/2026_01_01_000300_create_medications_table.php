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
        Schema::create('medications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();

            $table->string('name');
            $table->string('dosage');
            $table->string('form')->nullable();
            $table->text('instructions')->nullable();
            $table->string('photo_path')->nullable();

            $table->string('frequency');
            $table->jsonb('times')->default('[]');
            $table->jsonb('days_of_week')->default('[]');
            $table->boolean('with_food')->default(false);
            $table->boolean('is_high_priority')->default(false);

            $table->integer('stock_quantity')->default(0);
            $table->unsignedInteger('units_per_dose')->default(1);
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->unsignedSmallInteger('refill_reminder_days')->default(7);

            $table->string('pharmacy_name')->nullable();
            $table->string('pharmacy_phone')->nullable();

            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['care_circle_id', 'is_active']);
            $table->index(['care_circle_id', 'owner_user_id']);
        });

        $this->isolate('medications');
    }

    public function down(): void
    {
        $this->removeIsolation('medications');
        Schema::dropIfExists('medications');
    }
};
