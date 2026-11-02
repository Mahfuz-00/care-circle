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
        // Append-only ledger. PRD §9: actor, care-circle, IP, level, payload.
        // There is deliberately no UPDATE or DELETE policy.
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_circle_id')->nullable()->constrained('care_circles')->cascadeOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_role')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('level')->default('info');
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->jsonb('payload')->default('{}');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['care_circle_id', 'created_at']);
            $table->index(['actor_user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });

        $this->isolateAppendOnly('audit_logs');
    }

    public function down(): void
    {
        $this->removeIsolation('audit_logs');
        Schema::dropIfExists('audit_logs');
    }
};
