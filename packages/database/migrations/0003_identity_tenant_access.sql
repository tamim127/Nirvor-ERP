CREATE TABLE app.users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  password_hash text,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_ci ON app.users (lower(email));

CREATE TABLE app.sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  token_hash bytea NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);
CREATE INDEX sessions_user_active ON app.sessions(user_id, expires_at) WHERE revoked_at IS NULL;

CREATE TABLE app.tenants (
  id uuid PRIMARY KEY,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tenants_slug_ci ON app.tenants (lower(slug));

CREATE TABLE app.companies (
  tenant_id uuid NOT NULL REFERENCES app.tenants(id) ON DELETE RESTRICT,
  id uuid NOT NULL,
  legal_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id)
);

CREATE TABLE app.branches (
  tenant_id uuid NOT NULL,
  id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES app.tenants(id) ON DELETE RESTRICT
);

CREATE TABLE app.memberships (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id),
  FOREIGN KEY (tenant_id) REFERENCES app.tenants(id) ON DELETE RESTRICT
);

CREATE TABLE app.membership_branch_access (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, user_id, branch_id),
  FOREIGN KEY (tenant_id, user_id) REFERENCES app.memberships(tenant_id, user_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, branch_id) REFERENCES app.branches(tenant_id, id) ON DELETE RESTRICT
);

CREATE TABLE app.audit_events (
  tenant_id uuid NOT NULL REFERENCES app.tenants(id) ON DELETE RESTRICT,
  id uuid NOT NULL,
  actor_user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX audit_events_tenant_created ON app.audit_events(tenant_id, created_at DESC);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['companies', 'branches', 'memberships', 'membership_branch_access', 'audit_events'] LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY tenant_scope ON app.%I USING (tenant_id = app.current_tenant_id()) WITH CHECK (tenant_id = app.current_tenant_id())', table_name);
  END LOOP;
END $$;

REVOKE ALL ON app.users, app.sessions, app.tenants, app.companies, app.branches,
  app.memberships, app.membership_branch_access, app.audit_events FROM PUBLIC;
GRANT USAGE ON SCHEMA app TO nirvor_runtime, nirvor_test_runtime;
GRANT SELECT, INSERT, UPDATE ON app.users, app.sessions TO nirvor_runtime, nirvor_test_runtime;
GRANT SELECT, INSERT, UPDATE ON app.tenants, app.companies, app.branches, app.memberships,
  app.membership_branch_access TO nirvor_runtime, nirvor_test_runtime;
GRANT SELECT, INSERT ON app.audit_events TO nirvor_runtime, nirvor_test_runtime;
