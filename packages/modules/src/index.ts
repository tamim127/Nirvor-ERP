export interface ModuleRef {
  readonly id: string;
  readonly version: number;
}

export interface TenantSetupStep {
  readonly key: string;
  readonly scope: 'tenant_configuration';
}

export interface ModuleManifest extends ModuleRef {
  readonly status: 'active' | 'deprecated' | 'retired';
  readonly dependencies: readonly ModuleRef[];
  readonly conflicts: readonly string[];
  readonly setupSteps: readonly TenantSetupStep[];
  readonly deactivationDataMode: 'read_only' | 'archived' | 'inaccessible';
}

export type ModulePlanIssueCode =
  | 'catalog_conflict'
  | 'dependency_cycle'
  | 'invalid_manifest'
  | 'invalid_resume_state'
  | 'module_conflict'
  | 'module_unavailable'
  | 'version_conflict';

export interface ModulePlanIssue {
  readonly code: ModulePlanIssueCode;
  readonly subject: string;
}

export interface TenantSetupOperation {
  readonly operationId: string;
  readonly module: ModuleRef;
  readonly stepKey: string;
  readonly scope: 'tenant_configuration';
}

export type ActivationPlan =
  | { readonly ok: false; readonly issues: readonly ModulePlanIssue[] }
  | {
      readonly ok: true;
      readonly activationOrder: readonly ModuleRef[];
      readonly operations: readonly TenantSetupOperation[];
      readonly pendingOperations: readonly TenantSetupOperation[];
    };

const identifier = /^[a-z][a-z0-9_.-]{2,95}$/;

function refKey(ref: ModuleRef): string {
  return `${ref.id}@${ref.version}`;
}

function isRef(ref: ModuleRef): boolean {
  return identifier.test(ref.id) && Number.isSafeInteger(ref.version) && ref.version > 0;
}

function validateManifest(manifest: ModuleManifest): boolean {
  if (
    !isRef(manifest) ||
    !['active', 'deprecated', 'retired'].includes(manifest.status) ||
    !['read_only', 'archived', 'inaccessible'].includes(manifest.deactivationDataMode) ||
    !manifest.dependencies.every(isRef) ||
    !manifest.conflicts.every((value) => identifier.test(value))
  )
    return false;
  const stepKeys = new Set<string>();
  for (const step of manifest.setupSteps) {
    if (
      step.scope !== 'tenant_configuration' ||
      !identifier.test(step.key) ||
      stepKeys.has(step.key)
    )
      return false;
    stepKeys.add(step.key);
  }
  return true;
}

function issue(code: ModulePlanIssueCode, subject: string): ModulePlanIssue {
  return { code, subject };
}

export function planModuleActivation(input: {
  readonly catalog: readonly ModuleManifest[];
  readonly active: readonly ModuleRef[];
  readonly requested: readonly ModuleRef[];
  readonly completedOperationIds?: ReadonlySet<string>;
}): ActivationPlan {
  const issues: ModulePlanIssue[] = [];
  const catalog = new Map<string, ModuleManifest>();
  for (const manifest of input.catalog) {
    const key = refKey(manifest);
    if (!validateManifest(manifest)) issues.push(issue('invalid_manifest', key));
    else if (catalog.has(key)) issues.push(issue('catalog_conflict', key));
    else catalog.set(key, manifest);
  }
  const active = new Map<string, ModuleRef>();
  for (const ref of input.active) {
    if (!isRef(ref)) issues.push(issue('invalid_manifest', refKey(ref)));
    const existing = active.get(ref.id);
    if (existing && existing.version !== ref.version)
      issues.push(issue('version_conflict', ref.id));
    active.set(ref.id, ref);
    if (!catalog.has(refKey(ref))) issues.push(issue('module_unavailable', refKey(ref)));
  }
  if (issues.length) return { ok: false, issues };

  const selected = new Map<string, ModuleRef>();
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: ModuleRef[] = [];
  const visit = (ref: ModuleRef): void => {
    const key = refKey(ref);
    const current = active.get(ref.id) ?? selected.get(ref.id);
    if (current && current.version !== ref.version) {
      issues.push(issue('version_conflict', ref.id));
      return;
    }
    if (active.has(ref.id) || visited.has(key)) return;
    if (visiting.has(key)) {
      issues.push(issue('dependency_cycle', key));
      return;
    }
    const manifest = catalog.get(key);
    if (!manifest || manifest.status === 'retired') {
      issues.push(issue('module_unavailable', key));
      return;
    }
    selected.set(ref.id, ref);
    visiting.add(key);
    for (const dependency of manifest.dependencies) visit(dependency);
    visiting.delete(key);
    if (!visited.has(key)) {
      visited.add(key);
      ordered.push(ref);
    }
  };
  for (const ref of input.requested) {
    if (!isRef(ref)) issues.push(issue('invalid_manifest', refKey(ref)));
    else visit(ref);
  }

  const enabledIds = new Set([...active.keys(), ...selected.keys()]);
  for (const ref of [...active.values(), ...selected.values()]) {
    const manifest = catalog.get(refKey(ref));
    if (!manifest) continue;
    for (const conflict of manifest.conflicts) {
      if (enabledIds.has(conflict)) issues.push(issue('module_conflict', `${ref.id}:${conflict}`));
    }
  }
  if (issues.length) return { ok: false, issues };

  const operations = ordered.flatMap((ref) => {
    const manifest = catalog.get(refKey(ref));
    if (!manifest) return [];
    return manifest.setupSteps.map((step) => ({
      operationId: `${refKey(ref)}:${step.key}`,
      module: ref,
      stepKey: step.key,
      scope: step.scope,
    }));
  });
  const operationIds = new Set(operations.map((operation) => operation.operationId));
  const completed = input.completedOperationIds ?? new Set<string>();
  for (const completedId of completed) {
    if (!operationIds.has(completedId)) issues.push(issue('invalid_resume_state', completedId));
  }
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    activationOrder: ordered,
    operations,
    pendingOperations: operations.filter((operation) => !completed.has(operation.operationId)),
  };
}

export type DeactivationPlan =
  | { readonly ok: false; readonly issues: readonly ModulePlanIssue[] }
  | {
      readonly ok: true;
      readonly module: ModuleRef;
      readonly dataMode: 'read_only' | 'archived' | 'inaccessible';
      readonly preservesHistoricalData: true;
    };

export function planModuleDeactivation(input: {
  readonly catalog: readonly ModuleManifest[];
  readonly active: readonly ModuleRef[];
  readonly target: ModuleRef;
}): DeactivationPlan {
  const issues: ModulePlanIssue[] = [];
  const catalog = new Map<string, ModuleManifest>();
  for (const manifest of input.catalog) {
    const key = refKey(manifest);
    if (!validateManifest(manifest)) issues.push(issue('invalid_manifest', key));
    else if (catalog.has(key)) issues.push(issue('catalog_conflict', key));
    else catalog.set(key, manifest);
  }
  const activeIds = new Map<string, number>();
  for (const ref of input.active) {
    if (!isRef(ref) || !catalog.has(refKey(ref)))
      issues.push(issue('module_unavailable', refKey(ref)));
    const existingVersion = activeIds.get(ref.id);
    if (existingVersion !== undefined && existingVersion !== ref.version)
      issues.push(issue('version_conflict', ref.id));
    activeIds.set(ref.id, ref.version);
  }
  if (!input.active.some((ref) => refKey(ref) === refKey(input.target)))
    issues.push(issue('module_unavailable', `inactive:${refKey(input.target)}`));
  const target = catalog.get(refKey(input.target));
  if (!target) issues.push(issue('module_unavailable', refKey(input.target)));
  if (issues.length || !target) return { ok: false, issues };
  const dependent = input.active.find((ref) => {
    if (ref.id === input.target.id) return false;
    return catalog
      .get(refKey(ref))
      ?.dependencies.some((dependency) => refKey(dependency) === refKey(input.target));
  });
  if (dependent)
    return { ok: false, issues: [issue('module_conflict', `required-by:${dependent.id}`)] };
  return {
    ok: true,
    module: input.target,
    dataMode: target.deactivationDataMode,
    preservesHistoricalData: true,
  };
}

export type ConfigurationValue = string | number | boolean | null;

export interface TemplateConfigurationEntry {
  readonly key: string;
  readonly value: ConfigurationValue;
}

export interface PublishedTemplate {
  readonly id: string;
  readonly version: number;
  readonly status: 'published';
  readonly modules: readonly ModuleRef[];
  readonly configuration: readonly TemplateConfigurationEntry[];
}

export interface TenantConfigurationEntry extends TemplateConfigurationEntry {
  readonly source: 'tenant' | 'template';
  readonly customized: boolean;
}

export interface ConfigurationConflict {
  readonly key: string;
  readonly current: ConfigurationValue;
  readonly proposed: ConfigurationValue;
}

function isConfigurationValue(value: unknown): value is ConfigurationValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

export type TemplatePreview =
  | { readonly ok: false; readonly issues: readonly ModulePlanIssue[] }
  | {
      readonly ok: true;
      readonly template: ModuleRef;
      readonly modulePlan: Extract<ActivationPlan, { readonly ok: true }>;
      readonly changes: readonly TemplateConfigurationEntry[];
      readonly conflicts: readonly ConfigurationConflict[];
    };

export function previewTemplateApplication(input: {
  readonly template: PublishedTemplate;
  readonly catalog: readonly ModuleManifest[];
  readonly activeModules: readonly ModuleRef[];
  readonly tenantConfiguration: readonly TenantConfigurationEntry[];
  readonly completedOperationIds?: ReadonlySet<string>;
}): TemplatePreview {
  const templateRef = { id: input.template.id, version: input.template.version };
  const configKeys = new Set<string>();
  let invalidTemplate = input.template.status !== 'published' || !isRef(templateRef);
  for (const entry of input.template.configuration) {
    if (
      !identifier.test(entry.key) ||
      configKeys.has(entry.key) ||
      !isConfigurationValue(entry.value)
    )
      invalidTemplate = true;
    configKeys.add(entry.key);
  }
  if (invalidTemplate)
    return { ok: false, issues: [issue('invalid_manifest', refKey(templateRef))] };

  const modulePlan = planModuleActivation({
    catalog: input.catalog,
    active: input.activeModules,
    requested: input.template.modules,
    ...(input.completedOperationIds ? { completedOperationIds: input.completedOperationIds } : {}),
  });
  if (!modulePlan.ok) return modulePlan;

  const current = new Map<string, TenantConfigurationEntry>();
  for (const entry of input.tenantConfiguration) {
    if (
      !identifier.test(entry.key) ||
      current.has(entry.key) ||
      !isConfigurationValue(entry.value) ||
      !['tenant', 'template'].includes(entry.source) ||
      typeof entry.customized !== 'boolean'
    )
      return { ok: false, issues: [issue('invalid_manifest', `configuration:${entry.key}`)] };
    current.set(entry.key, entry);
  }
  const changes: TemplateConfigurationEntry[] = [];
  const conflicts: ConfigurationConflict[] = [];
  for (const proposed of input.template.configuration) {
    const existing = current.get(proposed.key);
    if (!existing) changes.push(proposed);
    else if (existing.value === proposed.value) continue;
    else if (existing.source === 'template' && !existing.customized) changes.push(proposed);
    else conflicts.push({ key: proposed.key, current: existing.value, proposed: proposed.value });
  }
  return { ok: true, template: templateRef, modulePlan, changes, conflicts };
}
