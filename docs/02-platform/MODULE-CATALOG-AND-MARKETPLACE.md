# Module Catalog and Marketplace

## 1. Catalog model

Each module entry should define:
- Stable identifier and display metadata
- Version and compatibility
- Commercial availability
- Dependencies and conflicts
- Required permissions
- Entitlement keys
- Setup prerequisites
- Data ownership and migration behavior
- Support lifecycle and deprecation policy

## 2. Activation lifecycle

1. Check subscription and entitlement.
2. Check dependencies and tenant eligibility.
3. Preview setup and data impact.
4. Apply versioned migrations/configuration.
5. Activate module and permissions.
6. Record audit event.
7. Verify health and expose navigation.

## 3. Deactivation

Disabling a module must not automatically delete its data. Define whether it becomes read-only, export-only, archived, or inaccessible. Preserve audit and legal records.

## 4. Marketplace future

Third-party modules require publisher identity, signing/review, permission declarations, version compatibility, sandboxing strategy, billing rules, support ownership, and vulnerability response. Do not execute untrusted plugins in-process.
