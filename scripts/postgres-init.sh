#!/bin/sh
set -eu

# This committed script contains no credentials. Compose supplies generated local-only URLs,
# and psql quotes their hex passwords as SQL literals without printing them.
password_from_url() {
  after_scheme=${1#*://}
  credentials=${after_scheme%%@*}
  printf '%s' "${credentials#*:}"
}

migrator_password=$(password_from_url "$NIRVOR_MIGRATION_DATABASE_URL")
runtime_password=$(password_from_url "$NIRVOR_RUNTIME_DATABASE_URL")
test_migrator_password=$(password_from_url "$NIRVOR_TEST_MIGRATION_DATABASE_URL")
test_runtime_password=$(password_from_url "$NIRVOR_TEST_RUNTIME_DATABASE_URL")

psql --set=ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  --set=migrator_password="$migrator_password" \
  --set=runtime_password="$runtime_password" \
  --set=test_migrator_password="$test_migrator_password" \
  --set=test_runtime_password="$test_runtime_password" <<'SQL'
CREATE ROLE nirvor_migrator LOGIN PASSWORD :'migrator_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE nirvor_runtime LOGIN PASSWORD :'runtime_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE nirvor_test_migrator LOGIN PASSWORD :'test_migrator_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE nirvor_test_runtime LOGIN PASSWORD :'test_runtime_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;

CREATE DATABASE nirvor OWNER nirvor_migrator;
CREATE DATABASE nirvor_test OWNER nirvor_test_migrator;
REVOKE ALL ON DATABASE nirvor FROM PUBLIC;
REVOKE ALL ON DATABASE nirvor_test FROM PUBLIC;
GRANT CONNECT ON DATABASE nirvor TO nirvor_runtime;
GRANT CONNECT ON DATABASE nirvor_test TO nirvor_test_runtime;

\connect nirvor
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
\connect nirvor_test
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL

unset migrator_password runtime_password test_migrator_password test_runtime_password
