export type SubscriptionState =
  'pending_activation' | 'trialing' | 'active' | 'past_due' | 'suspended' | 'canceled' | 'expired';

export type RequestedAccess = 'read' | 'write';
export type SubscriptionAccess = 'enabled' | 'read_only' | 'disabled';

export interface FeatureCatalogEntry {
  readonly key: string;
  readonly version: number;
  readonly status: 'active' | 'retired';
}

export interface TimedFeatureRule {
  readonly feature: string;
  readonly startsAt?: string;
  readonly endsAt?: string;
}

export interface UsageBoundary {
  readonly mode: 'hard' | 'soft';
  readonly limit: number;
  readonly used: number;
  readonly requested: number;
}

export interface EntitlementPolicy {
  readonly version: string;
  readonly subscriptionAccess: Readonly<Record<SubscriptionState, SubscriptionAccess>>;
  readonly restrictionOverridesGrant: boolean;
}

export interface EntitlementInput {
  readonly now: string;
  readonly feature: string;
  readonly requestedAccess: RequestedAccess;
  readonly catalog?: FeatureCatalogEntry;
  readonly subscriptionState: SubscriptionState;
  readonly planFeatures: ReadonlySet<string>;
  readonly addOns?: readonly TimedFeatureRule[];
  readonly grants?: readonly TimedFeatureRule[];
  readonly restrictions?: readonly TimedFeatureRule[];
  readonly platformRestricted?: boolean;
  readonly usage?: UsageBoundary;
  readonly policy?: EntitlementPolicy;
}

export type EntitlementReason =
  | 'allowed'
  | 'allowed_soft_limit'
  | 'catalog_unavailable'
  | 'feature_not_granted'
  | 'hard_limit_exhausted'
  | 'invalid_input'
  | 'platform_restricted'
  | 'policy_unavailable'
  | 'subscription_read_only'
  | 'subscription_unavailable'
  | 'tenant_restricted';

export interface EntitlementDecision {
  readonly allowed: boolean;
  readonly reason: EntitlementReason;
  readonly policyVersion?: string;
  readonly catalogVersion?: number;
}

function active(rule: TimedFeatureRule, feature: string, now: number): boolean {
  if (rule.feature !== feature) return false;
  const starts = rule.startsAt ? Date.parse(rule.startsAt) : Number.NEGATIVE_INFINITY;
  const ends = rule.endsAt ? Date.parse(rule.endsAt) : Number.POSITIVE_INFINITY;
  return Number.isFinite(starts) || starts === Number.NEGATIVE_INFINITY
    ? (Number.isFinite(ends) || ends === Number.POSITIVE_INFINITY) && starts <= now && now < ends
    : false;
}

function deny(
  reason: EntitlementReason,
  policy?: EntitlementPolicy,
  catalog?: FeatureCatalogEntry,
): EntitlementDecision {
  return {
    allowed: false,
    reason,
    ...(policy ? { policyVersion: policy.version } : {}),
    ...(catalog ? { catalogVersion: catalog.version } : {}),
  };
}

export function evaluateEntitlement(input: EntitlementInput): EntitlementDecision {
  const now = Date.parse(input.now);
  if (!Number.isFinite(now) || !/^[a-z][a-z0-9_.-]{2,95}$/.test(input.feature))
    return deny('invalid_input', input.policy, input.catalog);
  if (!input.policy?.version) return deny('policy_unavailable', undefined, input.catalog);
  if (
    !input.catalog ||
    input.catalog.key !== input.feature ||
    input.catalog.status !== 'active' ||
    !Number.isSafeInteger(input.catalog.version) ||
    input.catalog.version <= 0
  )
    return deny('catalog_unavailable', input.policy, input.catalog);
  if (input.platformRestricted) return deny('platform_restricted', input.policy, input.catalog);

  const access = input.policy.subscriptionAccess[input.subscriptionState];
  if (!access || access === 'disabled')
    return deny('subscription_unavailable', input.policy, input.catalog);
  if (access === 'read_only' && input.requestedAccess === 'write')
    return deny('subscription_read_only', input.policy, input.catalog);

  const restricted = (input.restrictions ?? []).some((rule) => active(rule, input.feature, now));
  const granted =
    input.planFeatures.has(input.feature) ||
    (input.addOns ?? []).some((rule) => active(rule, input.feature, now)) ||
    (input.grants ?? []).some((rule) => active(rule, input.feature, now));
  if (restricted && (input.policy.restrictionOverridesGrant || !granted))
    return deny('tenant_restricted', input.policy, input.catalog);
  if (!granted) return deny('feature_not_granted', input.policy, input.catalog);

  const usage = input.usage;
  if (usage) {
    const requestedTotal = usage.used + usage.requested;
    if (
      ![usage.limit, usage.used, usage.requested].every(Number.isSafeInteger) ||
      !Number.isSafeInteger(requestedTotal) ||
      usage.limit < 0 ||
      usage.used < 0 ||
      usage.requested <= 0
    )
      return deny('invalid_input', input.policy, input.catalog);
    if (requestedTotal > usage.limit) {
      if (usage.mode === 'hard') return deny('hard_limit_exhausted', input.policy, input.catalog);
      return {
        allowed: true,
        reason: 'allowed_soft_limit',
        policyVersion: input.policy.version,
        catalogVersion: input.catalog.version,
      };
    }
  }
  return {
    allowed: true,
    reason: 'allowed',
    policyVersion: input.policy.version,
    catalogVersion: input.catalog.version,
  };
}

export interface SubscriptionTransitionPolicy {
  readonly version: string;
  readonly allowed: Readonly<Record<SubscriptionState, readonly SubscriptionState[]>>;
}

export function canTransitionSubscription(
  from: SubscriptionState,
  to: SubscriptionState,
  policy?: SubscriptionTransitionPolicy,
): boolean {
  if (!policy?.version || from === to) return false;
  return policy.allowed[from]?.includes(to) === true;
}
