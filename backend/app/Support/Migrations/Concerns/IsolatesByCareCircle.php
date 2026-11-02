<?php

declare(strict_types=1);

namespace App\Support\Migrations\Concerns;

use Illuminate\Support\Facades\DB;

/**
 * Applies the PRD §9 tenant-isolation contract to a migration:
 * "ENABLE + FORCE ROW LEVEL SECURITY with policies keyed on session GUCs.
 *  Unset context returns zero rows."
 */
trait IsolatesByCareCircle
{
    /**
     * Full read/write isolation for a care-circle-owned table.
     */
    protected function isolate(string $table, string $column = 'care_circle_id'): void
    {
        DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");

        $context = $this->careCircleContext($column);

        DB::statement("CREATE POLICY {$table}_isolation ON {$table} USING ({$context}) WITH CHECK ({$context})");
    }

    /**
     * Append-only isolation: rows can be read and appended under context, but never
     * updated or deleted. Used by the audit ledger and channel logs.
     *
     * Insertion also accepts rows with no care circle at all: a login or a logout
     * belongs to an actor, not to a tenant. Those rows stay invisible to every
     * tenant because the SELECT policy still requires a matching circle context.
     */
    protected function isolateAppendOnly(string $table, string $column = 'care_circle_id'): void
    {
        DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");

        $context = $this->careCircleContext($column);

        DB::statement("CREATE POLICY {$table}_select ON {$table} FOR SELECT USING ({$context})");
        DB::statement("CREATE POLICY {$table}_insert ON {$table} FOR INSERT WITH CHECK ({$context} OR {$column} IS NULL)");
    }

    /**
     * The care circle listing needs to answer "which circles am I in?" before any
     * circle context exists, so the two membership tables key off the acting user
     * as well as the active circle.
     */
    protected function isolateByMembership(string $table): void
    {
        DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");

        $circle = $this->careCircleContext('care_circle_id');
        $member = $this->userContext();

        DB::statement("CREATE POLICY {$table}_isolation ON {$table} USING ({$circle} OR {$member}) WITH CHECK ({$circle} OR {$member})");
    }

    /**
     * The care_circles table itself. A user may always see the circles they belong
     * to — so the app can answer "which circles am I in?" before any context
     * exists — and the circles they own.
     *
     * The owner clause is load-bearing, not cosmetic: Eloquent's `create()` uses
     * `INSERT ... RETURNING`, and RETURNING re-reads the new row through the USING
     * clause. A circle created before its first member row exists would otherwise
     * be invisible to itself and the insert would fail.
     */
    protected function isolateCareCircles(string $table = 'care_circles', string $column = 'id'): void
    {
        DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");

        $user = "nullif(current_setting('app.current_user_id', true), '')::bigint";

        $circle = $this->careCircleContext($column);
        $member = "EXISTS (SELECT 1 FROM care_circle_members m WHERE m.care_circle_id = {$table}.{$column} AND m.user_id = {$user})";
        $owner = "owner_user_id = {$user}";

        DB::statement("CREATE POLICY {$table}_isolation ON {$table} USING ({$circle} OR {$member} OR {$owner}) WITH CHECK ({$circle} OR {$owner})");
    }

    /**
     * Invitations must be findable by the person they were addressed to *before*
     * they are a member — otherwise the token could never be accepted. The email
     * lookup joins users, which carries no RLS of its own.
     */
    protected function isolateInvitations(string $table = 'care_circle_invitations'): void
    {
        DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");

        $circle = $this->careCircleContext('care_circle_id');
        $invitee = "email = (SELECT email FROM users WHERE id = nullif(current_setting('app.current_user_id', true), '')::bigint)";

        DB::statement("CREATE POLICY {$table}_isolation ON {$table} USING ({$circle} OR {$invitee}) WITH CHECK ({$circle})");
    }

    protected function removeIsolation(string $table): void
    {
        DB::statement("DROP POLICY IF EXISTS {$table}_isolation ON {$table}");
        DB::statement("DROP POLICY IF EXISTS {$table}_select ON {$table}");
        DB::statement("DROP POLICY IF EXISTS {$table}_insert ON {$table}");
        DB::statement("ALTER TABLE {$table} NO FORCE ROW LEVEL SECURITY");
        DB::statement("ALTER TABLE {$table} DISABLE ROW LEVEL SECURITY");
    }

    /**
     * Unset context yields NULL, so the comparison is never true and the table
     * returns zero rows — fail closed, never fail open.
     */
    private function careCircleContext(string $column): string
    {
        return "{$column} = nullif(current_setting('app.current_care_circle_id', true), '')::bigint";
    }

    private function userContext(): string
    {
        return "user_id = nullif(current_setting('app.current_user_id', true), '')::bigint";
    }
}
