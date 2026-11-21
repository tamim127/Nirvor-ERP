import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  decideLeadTransition,
  type LeadLifecyclePolicy,
  type LeadSnapshot,
  type TransitionLeadCommand,
} from '../src/index.js';

const policy: LeadLifecyclePolicy = {
  version: 'crm-policy-v1',
  transitions: {
    new: ['qualified', 'disqualified'],
    qualified: ['converted', 'disqualified'],
    disqualified: ['new'],
    converted: [],
  },
  disqualificationReasonCodes: new Set(['not_a_fit', 'duplicate']),
  requireDisqualificationReason: true,
};
const lead: LeadSnapshot = { id: 'lead_00000001', state: 'new', revision: 0 };
const command: TransitionLeadCommand = {
  commandId: 'command_00000001',
  actorId: 'actor_00000001',
  expectedRevision: 0,
  targetState: 'qualified',
  occurredAt: '2026-11-21T12:00:00.000Z',
};

test('lead transition emits an audit-ready versioned event', () => {
  const decision = decideLeadTransition({ lead, command, policy });
  assert.equal(decision.allowed, true);
  if (!decision.allowed) return;
  assert.deepEqual(decision.next, { id: lead.id, state: 'qualified', revision: 1 });
  assert.deepEqual(decision.event, {
    type: 'crm.lead.transitioned',
    eventVersion: 1,
    commandId: command.commandId,
    actorId: command.actorId,
    leadId: lead.id,
    previousState: 'new',
    nextState: 'qualified',
    revision: 1,
    occurredAt: command.occurredAt,
    policyVersion: policy.version,
  });
});

test('missing or malformed policy fails closed', () => {
  assert.equal(decideLeadTransition({ lead, command }).reason, 'policy_unavailable');
  const malformed = {
    ...policy,
    transitions: { ...policy.transitions, new: ['new'] },
  } as LeadLifecyclePolicy;
  assert.equal(
    decideLeadTransition({ lead, command, policy: malformed }).reason,
    'policy_unavailable',
  );
  const missingReasons = {
    ...policy,
    disqualificationReasonCodes: undefined,
  } as unknown as LeadLifecyclePolicy;
  assert.equal(
    decideLeadTransition({ lead, command, policy: missingReasons }).reason,
    'policy_unavailable',
  );
});

test('illegal and stale transitions are denied', () => {
  assert.equal(
    decideLeadTransition({
      lead,
      command: { ...command, targetState: 'converted' },
      policy,
    }).reason,
    'invalid_transition',
  );
  assert.equal(
    decideLeadTransition({
      lead,
      command: { ...command, expectedRevision: 1 },
      policy,
    }).reason,
    'stale_revision',
  );
});

test('duplicate command IDs signal persistence to return the stored result', () => {
  assert.equal(
    decideLeadTransition({
      lead,
      command,
      policy,
      processedCommandIds: new Set([command.commandId]),
    }).reason,
    'duplicate_command',
  );
});

test('conversion requires a bounded contact reference and clears unrelated fields', () => {
  const qualified: LeadSnapshot = { ...lead, state: 'qualified', revision: 3 };
  const conversion = { ...command, expectedRevision: 3, targetState: 'converted' as const };
  assert.equal(
    decideLeadTransition({ lead: qualified, command: conversion, policy }).reason,
    'invalid_input',
  );

  const decision = decideLeadTransition({
    lead: qualified,
    command: { ...conversion, convertedContactId: 'contact_00000001' },
    policy,
  });
  assert.equal(decision.allowed, true);
  if (decision.allowed) assert.equal(decision.next.convertedContactId, 'contact_00000001');

  const malformedConverted = {
    id: lead.id,
    state: 'converted',
    revision: 4,
    convertedContactId: 'contact_00000001',
    disqualificationReasonCode: 'not_a_fit',
  } as const;
  assert.equal(
    decideLeadTransition({
      lead: malformedConverted,
      command: { ...command, expectedRevision: 4 },
      policy,
    }).reason,
    'invalid_input',
  );
});

test('disqualification uses approved reason codes instead of free text', () => {
  assert.equal(
    decideLeadTransition({
      lead,
      command: { ...command, targetState: 'disqualified' },
      policy,
    }).reason,
    'invalid_input',
  );
  const decision = decideLeadTransition({
    lead,
    command: {
      ...command,
      targetState: 'disqualified',
      disqualificationReasonCode: 'not_a_fit',
    },
    policy,
  });
  assert.equal(decision.allowed, true);
});
