<?php

declare(strict_types=1);

namespace App\Services\Stock;

use App\Enums\EscalationChannel;
use App\Enums\MemberStatus;
use App\Enums\StockEventType;
use App\Models\CareCircleMember;
use App\Models\Medication;
use App\Models\StockEvent;
use App\Models\User;
use App\Services\Channels\ChannelManager;

/**
 * PRD §5.1 — stock tracking, automatic days-remaining, and proactive
 * low-stock / refill reminders to the senior *and* the caregivers.
 */
final class StockService
{
    public function __construct(private readonly ChannelManager $channels) {}

    /**
     * Consume the doses a taken dose requires and warn if that crosses the threshold.
     */
    public function recordDoseTaken(Medication $medication, User $actor): StockEvent
    {
        return $this->apply(
            medication: $medication,
            delta: -max(1, $medication->units_per_dose),
            type: StockEventType::DoseTaken,
            actor: $actor,
        );
    }

    public function refill(Medication $medication, int $quantity, User $actor, ?string $note = null): StockEvent
    {
        return $this->apply(
            medication: $medication,
            delta: $quantity,
            type: StockEventType::Refill,
            actor: $actor,
            note: $note,
        );
    }

    public function adjust(Medication $medication, int $delta, User $actor, ?string $note = null): StockEvent
    {
        return $this->apply(
            medication: $medication,
            delta: $delta,
            type: StockEventType::Adjustment,
            actor: $actor,
            note: $note,
        );
    }

    private function apply(
        Medication $medication,
        int $delta,
        StockEventType $type,
        User $actor,
        ?string $note = null,
    ): StockEvent {
        $wasLow = $medication->isLowStock();

        $medication->stock_quantity = max(0, $medication->stock_quantity + $delta);
        $medication->save();

        $event = StockEvent::create([
            'care_circle_id' => $medication->care_circle_id,
            'medication_id' => $medication->id,
            'type' => $type,
            'delta' => $delta,
            'resulting_quantity' => $medication->stock_quantity,
            'note' => $note,
            'actor_user_id' => $actor->id,
        ]);

        // Warn on the transition into low stock, and once more if it hits zero.
        if (! $wasLow && $medication->isLowStock()) {
            $this->notifyLowStock($medication, $actor);
        }

        if ($medication->stock_quantity === 0 && $delta < 0) {
            StockEvent::create([
                'care_circle_id' => $medication->care_circle_id,
                'medication_id' => $medication->id,
                'type' => StockEventType::Depleted,
                'delta' => 0,
                'resulting_quantity' => 0,
                'note' => 'Stock reached zero.',
                'actor_user_id' => $actor->id,
            ]);
        }

        return $event;
    }

    /**
     * Tell the senior and every caregiver in one pass. Push only — this is a
     * reminder, not an emergency, and PRD §7 says never be aggressive.
     */
    private function notifyLowStock(Medication $medication, User $actor): void
    {
        StockEvent::create([
            'care_circle_id' => $medication->care_circle_id,
            'medication_id' => $medication->id,
            'type' => StockEventType::LowStockAlert,
            'delta' => 0,
            'resulting_quantity' => $medication->stock_quantity,
            'note' => 'Low stock threshold reached.',
            'actor_user_id' => $actor->id,
        ]);

        $recipients = CareCircleMember::query()
            ->where('care_circle_id', $medication->care_circle_id)
            ->where('status', MemberStatus::Active->value)
            ->pluck('user_id')
            ->push($medication->owner_user_id)
            ->unique();

        $channel = $this->channels->for(EscalationChannel::Push);

        foreach ($recipients as $userId) {
            $channel->send(
                careCircleId: (int) $medication->care_circle_id,
                targetUserId: (int) $userId,
                address: null,
                template: 'stock.low',
                payload: [
                    'medication_id' => $medication->id,
                    'medication' => $medication->name,
                    'remaining' => $medication->stock_quantity,
                    'days_remaining' => $medication->daysRemaining(),
                ],
            );
        }
    }
}
