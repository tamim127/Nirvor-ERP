# Phase 0 Acceptance Checklist

Status: In progress. Use the [work plan](PHASE-0-WORK-PLAN.md) and [decision register](OPEN-DECISIONS.md). Check an item only after recording its artifact, applicable verification evidence, reviewer and approval date. A draft does not satisfy an approval gate.

D-003 cardinality is owner-confirmed (one company, multiple branches), but the broader tenant model includes branch access and isolation decisions that remain unresolved; its checklist item therefore stays open. This planning update does not mark Phase 0 complete.

## Product
- [ ] Initial target segment selected
- [ ] Customer problems validated
- [ ] MVP workflows selected
- [ ] Product non-goals documented
- [ ] Initial plan and packaging assumptions documented

## Architecture
- [ ] Modular monolith boundaries reviewed
- [ ] Tenant/company/legal entity model approved
- [ ] RLS and ORM compatibility investigated
- [ ] Authentication/session approach approved
- [ ] API and event conventions approved
- [ ] Database migration approach approved
- [ ] Queue and realtime strategy approved

## SaaS platform
- [ ] Entitlement precedence approved
- [ ] Subscription lifecycle approved
- [ ] Usage metering dimensions selected
- [ ] Template lifecycle approved
- [ ] Module activation/deactivation behavior approved

## Security and operations
- [ ] Threat model reviewed
- [ ] Support access model approved
- [ ] Data retention and export policies identified
- [ ] Observability strategy approved
- [ ] Backup/restore ownership and targets identified
- [ ] Initial SLI/SLO measurement plan approved

## Delivery
- [ ] ADRs created for significant decisions
- [ ] MVP scope and acceptance criteria approved
- [ ] Phase 1 plan approved
- [ ] No unresolved critical architectural question
