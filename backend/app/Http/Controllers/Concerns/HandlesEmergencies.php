<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use App\Enums\EmergencyStatus;
use App\Enums\EscalationChannel;
use App\Models\EmergencyAlert;
use App\Models\User;
use App\Services\Escalation\EscalationEngine;

/**
 * PRD §5.5 — a medical emergency must reach the care circle immediately.
 * The emergency path deliberately skips the "is it overdue / is it high
 * priority" gates; every other gate still applies (quiet hours, budget,
 * attempt limits), which is what stops the system being aggressive in normal
 * operation without ever muting a real emergency.
 */
trait HandlesEmergencies
{
    protected function raiseEmergency(int $careCircleId, User $raiser, array $attributes): EmergencyAlert
    {
        $alert = EmergencyAlert::create([
            'care_circle_id' => $careCircleId,
            'raised_by_user_id' => $raiser->id,
            'type' => $attributes['type'],
            'status' => EmergencyStatus::Open,
            'latitude' => $attributes['latitude'] ?? null,
            'longitude' => $attributes['longitude'] ?? null,
            'location_label' => $attributes['location_label'] ?? null,
            'note' => $attributes['note'] ?? null,
        ]);

        $engine = app(EscalationEngine::class);

        // Push first — the least intrusive effective channel.
        $engine->attempt($alert, EscalationChannel::Push);
        $engine->attempt($alert, EscalationChannel::Voice);

        return $alert->refresh();
    }
}
