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
        // What the push / SMS / voice adapters actually did. The log adapters
        // write here instead of touching a real provider.
        Schema::create('channel_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->constrained('care_circles')->cascadeOnDelete();

            $table->string('channel');
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('target_address')->nullable();
            $table->string('template');
            $table->jsonb('payload')->default('{}');
            $table->string('provider');
            $table->string('status');
            $table->string('provider_message_id')->nullable();
            $table->text('error')->nullable();

            $table->timestamps();

            $table->index(['care_circle_id', 'created_at']);
        });

        $this->isolateAppendOnly('channel_messages');
    }

    public function down(): void
    {
        $this->removeIsolation('channel_messages');
        Schema::dropIfExists('channel_messages');
    }
};
