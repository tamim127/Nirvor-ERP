export type LeadState = 'new' | 'qualified' | 'disqualified' | 'converted';

export interface LeadSnapshot {
  readonly id: string;
  readonly state: LeadState;
  readonly revision: number;
  readonly convertedContactId?: string;
  readonly disqualificationReasonCode?: string;
}

export interface LeadLifecyclePolicy {
  readonly version: string;
  readonly transitions: Readonly<Record<LeadState, readonly LeadState[]>>;
  readonly disqualificationReasonCodes: ReadonlySet<string>;
  readonly requireDisqualificationReason: boolean;
}

export interface TransitionLeadCommand {
  readonly commandId: string;
  readonly actorId: string;
  readonly expectedRevision: number;
  readonly targetState: LeadState;
  readonly occurredAt: string;
  readonly convertedContactId?: string;
  readonly disqualificationReasonCode?: string;
}

export const CRM_PERMISSIONS = {
  createLead: 'crm.lead.create',
  readLead: 'crm.lead.read',
  transitionLead: 'crm.lead.transition',
  convertLead: 'crm.lead.convert',
} as const;

export type LeadDecisionReason =
  | 'allowed'
  | 'duplicate_command'
  | 'invalid_input'
  | 'invalid_transition'
  | 'policy_unavailable'
  | 'stale_revision';

export interface LeadTransitionedEvent {
  readonly type: 'crm.lead.transitioned';
  readonly eventVersion: 1;
  readonly commandId: string;
  readonly actorId: string;
  readonly leadId: string;
  readonly previousState: LeadState;
  readonly nextState: LeadState;
  readonly revision: number;
  readonly occurredAt: string;
  readonly policyVersion: string;
  readonly convertedContactId?: string;
  readonly disqualificationReasonCode?: string;
}

export type LeadTransitionDecision =
  | {
      readonly allowed: false;
      readonly reason: Exclude<LeadDecisionReason, 'allowed'>;
      readonly policyVersion?: string;
    }
  | {
      readonly allowed: true;
      readonly reason: 'allowed';
      readonly next: LeadSnapshot;
      readonly event: LeadTransitionedEvent;
    };

const identifier = /^[A-Za-z0-9][A-Za-z0-9_.:-]{7,127}$/;
const reasonCode = /^[a-z][a-z0-9_.-]{2,63}$/;
const states: readonly LeadState[] = ['new', 'qualified', 'disqualified', 'converted'];

function isState(value: unknown): value is LeadState {
  return states.includes(value as LeadState);
}

function validPolicy(policy: LeadLifecyclePolicy): boolean {
  if (
    !reasonCode.test(policy.version) ||
    typeof policy.requireDisqualificationReason !== 'boolean' ||
    !(policy.disqualificationReasonCodes instanceof Set) ||
    policy.disqualificationReasonCodes.size > 100
  )
    return false;
  for (const state of states) {
    const targets = policy.transitions[state];
    if (
      !Array.isArray(targets) ||
      targets.length > states.length - 1 ||
      targets.some((target) => !isState(target) || target === state) ||
      new Set(targets).size !== targets.length
    )
      return false;
  }
  return [...policy.disqualificationReasonCodes].every((code) => reasonCode.test(code));
}

function validSnapshot(lead: LeadSnapshot): boolean {
  if (!identifier.test(lead.id) || !isState(lead.state) || !Number.isSafeInteger(lead.revision))
    return false;
  if (lead.revision < 0 || lead.revision === Number.MAX_SAFE_INTEGER) return false;
  if (lead.state === 'converted')
    return (
      Boolean(lead.convertedContactId?.match(identifier)) &&
      lead.disqualificationReasonCode === undefined
    );
  if (lead.convertedContactId !== undefined) return false;
  if (lead.state !== 'disqualified' && lead.disqualificationReasonCode !== undefined) return false;
  return (
    lead.disqualificationReasonCode === undefined ||
    reasonCode.test(lead.disqualificationReasonCode)
  );
}

function deny(
  reason: Exclude<LeadDecisionReason, 'allowed'>,
  policy?: LeadLifecyclePolicy,
): LeadTransitionDecision {
  return {
    allowed: false,
    reason,
    ...(policy?.version ? { policyVersion: policy.version } : {}),
  };
}

export function decideLeadTransition(input: {
  readonly lead: LeadSnapshot;
  readonly command: TransitionLeadCommand;
  readonly policy?: LeadLifecyclePolicy;
  readonly processedCommandIds?: ReadonlySet<string>;
}): LeadTransitionDecision {
  const { lead, command, policy } = input;
  if (!policy || !validPolicy(policy)) return deny('policy_unavailable');
  const occurredAt = Date.parse(command.occurredAt);
  if (
    !validSnapshot(lead) ||
    !identifier.test(command.commandId) ||
    !identifier.test(command.actorId) ||
    !Number.isSafeInteger(command.expectedRevision) ||
    command.expectedRevision < 0 ||
    !isState(command.targetState) ||
    !Number.isFinite(occurredAt) ||
    new Date(occurredAt).toISOString() !== command.occurredAt
  )
    return deny('invalid_input', policy);
  if (input.processedCommandIds?.has(command.commandId)) return deny('duplicate_command', policy);
  if (command.expectedRevision !== lead.revision) return deny('stale_revision', policy);
  if (!policy.transitions[lead.state].includes(command.targetState))
    return deny('invalid_transition', policy);

  if (command.targetState === 'converted') {
    if (!command.convertedContactId || !identifier.test(command.convertedContactId))
      return deny('invalid_input', policy);
  } else if (command.convertedContactId !== undefined) return deny('invalid_input', policy);

  if (command.targetState === 'disqualified') {
    const code = command.disqualificationReasonCode;
    if (
      (policy.requireDisqualificationReason && !code) ||
      (code !== undefined && !policy.disqualificationReasonCodes.has(code))
    )
      return deny('invalid_input', policy);
  } else if (command.disqualificationReasonCode !== undefined) return deny('invalid_input', policy);

  const revision = lead.revision + 1;
  const next: LeadSnapshot = {
    id: lead.id,
    state: command.targetState,
    revision,
    ...(command.convertedContactId ? { convertedContactId: command.convertedContactId } : {}),
    ...(command.disqualificationReasonCode
      ? { disqualificationReasonCode: command.disqualificationReasonCode }
      : {}),
  };
  const event: LeadTransitionedEvent = {
    type: 'crm.lead.transitioned',
    eventVersion: 1,
    commandId: command.commandId,
    actorId: command.actorId,
    leadId: lead.id,
    previousState: lead.state,
    nextState: command.targetState,
    revision,
    occurredAt: command.occurredAt,
    policyVersion: policy.version,
    ...(command.convertedContactId ? { convertedContactId: command.convertedContactId } : {}),
    ...(command.disqualificationReasonCode
      ? { disqualificationReasonCode: command.disqualificationReasonCode }
      : {}),
  };
  return { allowed: true, reason: 'allowed', next, event };
}
