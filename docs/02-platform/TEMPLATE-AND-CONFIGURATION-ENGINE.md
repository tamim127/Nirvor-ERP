# Template and Configuration Engine

## 1. Purpose

Provide versioned industry starter configurations without forking the product or copying executable code.

## 2. Template contents

A template may declare:
- Industry and use-case metadata
- Default enabled modules
- Module dependency declarations
- Default roles and permission bundles
- Dashboard layout
- Workflow presets
- Chart of accounts starter structure (requires accounting review)
- Document numbering presets
- Terminology and localization preferences
- Sample/demo data only when explicitly requested

## 3. Versioning

Templates are immutable after publication. Changes create a new version. Tenants record the template/version used and any local customizations.

## 4. Applying updates

- Preview changes before applying.
- Never overwrite tenant data silently.
- Use explicit migration steps for configuration changes.
- Identify conflicts between template defaults and tenant customizations.
- Provide rollback where safe.
- Keep an audit record.

## 5. Security

Templates are declarative data, not arbitrary executable scripts. Validate schemas and permissions. Do not allow tenant templates to inject code into the server or browser.
