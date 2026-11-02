<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Medication;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\BuildsCareCircles;
use Tests\TestCase;

/**
 * PRD §9 — the isolation guarantee, asserted against the *runtime* role.
 *
 * This test deliberately does not wrap itself in a transaction: the assertions
 * run on a second database connection (`pgsql`, the restricted role) and must
 * therefore see committed rows.
 */
class TenantIsolationTest extends TestCase
{
    use BuildsCareCircles, DatabaseMigrations;

    /** The runtime role, not the migration owner. */
    private function runtime()
    {
        return DB::connection('pgsql');
    }

    public function test_the_runtime_role_is_not_the_owner_and_does_not_bypass_rls(): void
    {
        $role = $this->runtime()->selectOne('select current_user as name, rolbypassrls from pg_roles where rolname = current_user');

        $this->assertSame('care_circle_app', $role->name);
        $this->assertFalse((bool) $role->rolbypassrls, 'The runtime role must not bypass RLS.');
    }

    public function test_every_care_circle_table_has_enable_and_force_row_level_security(): void
    {
        $tables = [
            'care_circles',
            'care_circle_members',
            'care_circle_invitations',
            'medications',
            'medication_doses',
            'stock_events',
            'appointments',
            'emergency_alerts',
            'escalation_attempts',
            'channel_messages',
            'audit_logs',
        ];

        $rows = $this->runtime()->select(
            'select relname, relrowsecurity, relforcerowsecurity from pg_class where relname = any(?)',
            ['{'.implode(',', $tables).'}'],
        );

        $this->assertCount(count($tables), $rows, 'Every care-circle table must have a policy.');

        foreach ($rows as $row) {
            $this->assertTrue((bool) $row->relrowsecurity, "{$row->relname} must ENABLE ROW LEVEL SECURITY.");
            $this->assertTrue((bool) $row->relforcerowsecurity, "{$row->relname} must FORCE ROW LEVEL SECURITY.");
        }
    }

    public function test_unset_context_returns_zero_rows_never_everything(): void
    {
        $circle = $this->makeCircle();

        Medication::create([
            'care_circle_id' => $circle['circle']->id,
            'owner_user_id' => $circle['senior']->id,
            'name' => 'Metformin',
            'dosage' => '500 mg',
            'frequency' => 'daily',
            'times' => ['08:00'],
        ]);

        // The owner can see the row it just created…
        $this->assertSame(1, Medication::query()->count(), 'Fixture sanity check.');

        // …but with no session context, the runtime role sees nothing at all.
        foreach (['medications', 'medication_doses', 'appointments', 'emergency_alerts', 'audit_logs'] as $table) {
            $count = $this->runtime()->selectOne("select count(*) as aggregate from {$table}")->aggregate;

            $this->assertSame(0, (int) $count, "{$table} leaked rows without a care-circle context.");
        }
    }

    public function test_one_care_circle_can_never_see_another_circles_data(): void
    {
        $a = $this->makeCircle();
        $b = $this->makeCircle();

        Medication::create([
            'care_circle_id' => $a['circle']->id,
            'owner_user_id' => $a['senior']->id,
            'name' => 'AlphaMed',
            'dosage' => '1 mg',
            'frequency' => 'daily',
            'times' => ['09:00'],
        ]);

        Medication::create([
            'care_circle_id' => $b['circle']->id,
            'owner_user_id' => $b['senior']->id,
            'name' => 'BetaMed',
            'dosage' => '2 mg',
            'frequency' => 'daily',
            'times' => ['09:00'],
        ]);

        $connection = $this->runtime();
        $connection->statement("select set_config('app.current_care_circle_id', ?, false)", [(string) $a['circle']->id]);

        $visible = $connection->select('select name from medications');

        $this->assertCount(1, $visible);
        $this->assertSame('AlphaMed', $visible[0]->name);

        $connection->statement("select set_config('app.current_care_circle_id', '', false)");
    }

    public function test_the_runtime_role_cannot_write_into_another_care_circle(): void
    {
        $a = $this->makeCircle();
        $b = $this->makeCircle();

        $connection = $this->runtime();
        $connection->statement("select set_config('app.current_care_circle_id', ?, false)", [(string) $a['circle']->id]);

        $this->expectException(QueryException::class);

        // WITH CHECK must refuse a row addressed to a different circle.
        $connection->insert(
            'insert into medications (care_circle_id, owner_user_id, name, dosage, frequency, times, created_at, updated_at)
             values (?, ?, ?, ?, ?, ?, now(), now())',
            [$b['circle']->id, $b['senior']->id, 'Sneaky', '1 mg', 'daily', '["09:00"]'],
        );
    }

    public function test_the_audit_ledger_is_append_only(): void
    {
        $circle = $this->makeCircle();

        $connection = $this->runtime();
        $connection->statement("select set_config('app.current_care_circle_id', ?, false)", [(string) $circle['circle']->id]);

        $connection->insert(
            'insert into audit_logs (care_circle_id, level, action, payload, created_at) values (?, ?, ?, ?, now())',
            [$circle['circle']->id, 'info', 'test.action', '{}'],
        );

        // The ledger has SELECT and INSERT policies only. With no UPDATE policy,
        // a write is not an error — it matches nothing. History cannot be rewritten.
        $updated = $connection->update("update audit_logs set action = 'tampered'");
        $this->assertSame(0, $updated, 'The audit ledger must not be updatable.');

        $deleted = $connection->delete('delete from audit_logs');
        $this->assertSame(0, $deleted, 'The audit ledger must not be deletable.');

        $this->assertSame('test.action', $connection->selectOne('select action from audit_logs')->action);
    }

    /**
     * Actor-scoped ledger entries — a login, a logout — belong to a person, not a
     * circle. They are writable but must never be readable by a tenant.
     */
    public function test_actor_scoped_audit_entries_are_invisible_to_every_tenant(): void
    {
        $circle = $this->makeCircle();
        $connection = $this->runtime();

        $connection->insert(
            "insert into audit_logs (care_circle_id, level, action, payload, created_at)
             values (NULL, 'info', 'probe.login', '[]', now())"
        );

        // Inside a circle, that entry must not appear.
        $connection->statement("select set_config('app.current_care_circle_id', ?, false)", [(string) $circle['circle']->id]);

        $visible = $connection->selectOne("select count(*) as aggregate from audit_logs where action = 'probe.login'")->aggregate;

        $this->assertSame(0, (int) $visible, 'An actor-scoped entry leaked into a tenant view.');
    }

    /**
     * The other feature tests run as the migration owner, which bypasses RLS. This
     * one flips the application onto the restricted runtime role — the connection
     * that serves real requests — and drives the core loop through it.
     */
    public function test_the_core_loop_works_as_the_restricted_runtime_role(): void
    {
        config(['database.default' => 'pgsql']);
        DB::purge('pgsql');

        try {
            $register = $this->postJson('/api/v1/auth/register', [
                'name' => 'Runtime User',
                'email' => 'runtime@carecircle.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'self_user',
            ])->assertCreated();

            $token = $register->json('data.token');

            // A brand new account can add a medication, which requires the
            // care-circle context ResolveCareCircleContext establishes.
            $this->withToken($token)->postJson('/api/v1/medications', [
                'name' => 'Ibuprofen',
                'dosage' => '200 mg',
                'frequency' => 'daily',
                'times' => ['09:00'],
                'stock_quantity' => 20,
            ])->assertCreated();

            $this->withToken($token)->getJson('/api/v1/medications')
                ->assertOk()
                ->assertJsonCount(1, 'data')
                ->assertJsonPath('data.0.name', 'Ibuprofen');

            // The session endpoint must be able to answer "which circles am I in?"
            // before any circle has been selected — that is what proves the acting
            // user, not just the active circle, is in the RLS context.
            $this->withToken($token)->getJson('/api/v1/auth/me')
                ->assertOk()
                ->assertJsonCount(1, 'data.care_circles')
                ->assertJsonPath('data.care_circles.0.name', "Runtime User's circle");

            // Route-model binding queries the database, and every one of these
            // tables is behind RLS. If binding ran before the context was set, the
            // row would be invisible and this would 404 instead of 200.
            $circleId = $register->json('data.care_circle.id');

            $this->withToken($token)->getJson("/api/v1/care-circles/{$circleId}/members")
                ->assertOk()
                ->assertJsonCount(1, 'data');

            // A second, unrelated account sees the first account's data only if
            // isolation is broken. It must see nothing.
            $other = $this->postJson('/api/v1/auth/register', [
                'name' => 'Other User',
                'email' => 'other@carecircle.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'self_user',
            ])->assertCreated();

            $otherToken = $other->json('data.token');

            // The auth guard caches the resolved user for the life of the
            // application instance; a real HTTP boundary would not. Reset it before
            // acting as a different account, or this test would authenticate as the
            // first account and prove nothing.
            $this->app['auth']->forgetGuards();

            $this->withToken($otherToken)->getJson('/api/v1/auth/me')
                ->assertOk()
                ->assertJsonCount(1, 'data.care_circles')
                ->assertJsonPath('data.care_circles.0.name', "Other User's circle");

            $this->withToken($otherToken)->getJson('/api/v1/medications')
                ->assertOk()
                ->assertJsonCount(0, 'data');
        } finally {
            // Teardown drops the schema, and only the owner may do that.
            config(['database.default' => 'pgsql_migrations']);
            DB::purge('pgsql');
        }
    }
}
