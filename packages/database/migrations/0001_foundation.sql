CREATE SCHEMA app;
REVOKE ALL ON SCHEMA app FROM PUBLIC;

-- No company, branch, finance or inventory tables are introduced in Phase 1.
CREATE FUNCTION app.current_tenant_id() RETURNS uuid
LANGUAGE sql STABLE SET search_path = pg_catalog
AS $$ SELECT nullif(current_setting('app.tenant_id', true), '')::uuid $$;

REVOKE ALL ON FUNCTION app.current_tenant_id() FROM PUBLIC;
