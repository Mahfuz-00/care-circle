<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Sets the session GUCs every RLS policy is keyed on.
 *
 * The values are always written — including when they are empty — so that a
 * request can never inherit another request's context on a recycled connection.
 * An empty value resolves to NULL inside the policy (via `nullif`), which makes
 * every comparison false: unset context returns zero rows. Fail closed.
 */
final class CareCircleContext
{
    public const CIRCLE = 'app.current_care_circle_id';

    public const USER = 'app.current_user_id';

    public function apply(?int $careCircleId, ?int $userId): void
    {
        $this->set(self::CIRCLE, $careCircleId);
        $this->set(self::USER, $userId);
    }

    public function forget(): void
    {
        $this->apply(null, null);
    }

    public function set(string $key, int|string|null $value): void
    {
        DB::statement('select set_config(?, ?, false)', [$key, $value === null ? '' : (string) $value]);
    }

    public function currentCareCircleId(): ?int
    {
        return $this->read(self::CIRCLE);
    }

    public function currentUserId(): ?int
    {
        return $this->read(self::USER);
    }

    private function read(string $key): ?int
    {
        $value = DB::selectOne("select nullif(current_setting(?, true), '') as value", [$key])->value;

        return $value === null ? null : (int) $value;
    }
}
