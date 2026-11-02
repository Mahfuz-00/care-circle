-- CareCircle local database bootstrap.
--
-- Run once as a superuser:
--   psql -U postgres -h 127.0.0.1 -f database/sql/000_setup_roles.sql
--
-- Creates the two roles and two databases the project expects:
--   care_circle_owner  - owns every object; runs migrations and seeders; BYPASSRLS
--   care_circle_app    - the runtime role; subject to every RLS policy; no DDL
--
-- PRD §9: "The app connects as a restricted role; migrations run as owner."

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'care_circle_owner') THEN
        CREATE ROLE care_circle_owner LOGIN PASSWORD 'care_circle_owner';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'care_circle_app') THEN
        CREATE ROLE care_circle_app LOGIN PASSWORD 'care_circle_app';
    END IF;
END
$$;

-- The owner loads schema and seed data; it is never used to serve a request.
ALTER ROLE care_circle_owner BYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE;

-- The runtime role must never be able to sidestep a policy.
ALTER ROLE care_circle_app NOBYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE;

SELECT 'CREATE DATABASE care_circle OWNER care_circle_owner'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'care_circle')\gexec

SELECT 'CREATE DATABASE care_circle_test OWNER care_circle_owner'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'care_circle_test')\gexec

-- Grant the runtime role DML only, and make future tables (created by the owner
-- during migrations) inheritable without a manual re-grant.
\connect care_circle
GRANT USAGE ON SCHEMA public TO care_circle_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO care_circle_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO care_circle_app;
ALTER DEFAULT PRIVILEGES FOR ROLE care_circle_owner IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO care_circle_app;
ALTER DEFAULT PRIVILEGES FOR ROLE care_circle_owner IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO care_circle_app;

\connect care_circle_test
GRANT USAGE ON SCHEMA public TO care_circle_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO care_circle_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO care_circle_app;
ALTER DEFAULT PRIVILEGES FOR ROLE care_circle_owner IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO care_circle_app;
ALTER DEFAULT PRIVILEGES FOR ROLE care_circle_owner IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO care_circle_app;
