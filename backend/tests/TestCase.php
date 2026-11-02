<?php

declare(strict_types=1);

namespace Tests;

use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The plan catalogue is reference data, not fixture data — care circles
        // carry a foreign key to it, so it must exist in every test database.
        $this->seed(PlanSeeder::class);
    }
}
