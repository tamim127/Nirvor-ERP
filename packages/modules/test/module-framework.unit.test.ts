import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  planModuleActivation,
  planModuleDeactivation,
  previewTemplateApplication,
  type ModuleManifest,
} from '../src/index.js';

const contacts: ModuleManifest = {
  id: 'crm.contacts',
  version: 1,
  status: 'active',
  dependencies: [],
  conflicts: [],
  setupSteps: [{ key: 'roles.seed', scope: 'tenant_configuration' }],
  deactivationDataMode: 'read_only',
};
const sales: ModuleManifest = {
  id: 'sales.orders',
  version: 2,
  status: 'active',
  dependencies: [{ id: contacts.id, version: contacts.version }],
  conflicts: [],
  setupSteps: [{ key: 'numbering.seed', scope: 'tenant_configuration' }],
  deactivationDataMode: 'archived',
};

test('activation orders dependencies and resumes only known pending tenant operations', () => {
  const completed = new Set(['crm.contacts@1:roles.seed']);
  const plan = planModuleActivation({
    catalog: [sales, contacts],
    active: [],
    requested: [{ id: sales.id, version: sales.version }],
    completedOperationIds: completed,
  });
  assert.equal(plan.ok, true);
  if (!plan.ok) return;
  assert.deepEqual(
    plan.activationOrder.map((module) => module.id),
    ['crm.contacts', 'sales.orders'],
  );
  assert.deepEqual(
    plan.pendingOperations.map((operation) => operation.operationId),
    ['sales.orders@2:numbering.seed'],
  );
  assert.equal(
    plan.operations.every((operation) => operation.scope === 'tenant_configuration'),
    true,
  );
});

test('activation fails closed for conflicts, cycles, and mismatched resume state', () => {
  const conflicting: ModuleManifest = {
    ...sales,
    id: 'sales.legacy',
    dependencies: [],
    conflicts: ['sales.orders'],
  };
  const conflict = planModuleActivation({
    catalog: [contacts, sales, conflicting],
    active: [{ id: sales.id, version: sales.version }],
    requested: [{ id: conflicting.id, version: conflicting.version }],
  });
  assert.equal(conflict.ok, false);
  if (!conflict.ok)
    assert.equal(
      conflict.issues.some((item) => item.code === 'module_conflict'),
      true,
    );

  const cycleA: ModuleManifest = {
    ...contacts,
    id: 'cycle.alpha',
    dependencies: [{ id: 'cycle.beta', version: 1 }],
  };
  const cycleB: ModuleManifest = {
    ...contacts,
    id: 'cycle.beta',
    dependencies: [{ id: 'cycle.alpha', version: 1 }],
  };
  const cycle = planModuleActivation({
    catalog: [cycleA, cycleB],
    active: [],
    requested: [{ id: cycleA.id, version: cycleA.version }],
  });
  assert.equal(cycle.ok, false);
  if (!cycle.ok)
    assert.equal(
      cycle.issues.some((item) => item.code === 'dependency_cycle'),
      true,
    );

  const resume = planModuleActivation({
    catalog: [contacts],
    active: [],
    requested: [{ id: contacts.id, version: contacts.version }],
    completedOperationIds: new Set(['unknown@1:step']),
  });
  assert.equal(resume.ok, false);
  if (!resume.ok)
    assert.equal(
      resume.issues.some((item) => item.code === 'invalid_resume_state'),
      true,
    );
});

test('deactivation blocks active dependants and always preserves historical data', () => {
  const blocked = planModuleDeactivation({
    catalog: [contacts, sales],
    active: [contacts, sales],
    target: contacts,
  });
  assert.equal(blocked.ok, false);

  const plan = planModuleDeactivation({
    catalog: [contacts, sales],
    active: [contacts],
    target: contacts,
  });
  assert.equal(plan.ok, true);
  if (!plan.ok) return;
  assert.equal(plan.preservesHistoricalData, true);
  assert.equal(plan.dataMode, 'read_only');

  const inactive = planModuleDeactivation({
    catalog: [contacts],
    active: [],
    target: contacts,
  });
  assert.equal(inactive.ok, false);
});

test('template preview reports tenant conflicts without overwriting custom values', () => {
  const preview = previewTemplateApplication({
    template: {
      id: 'template.retail',
      version: 1,
      status: 'published',
      modules: [{ id: contacts.id, version: contacts.version }],
      configuration: [
        { key: 'locale.default', value: 'bn-BD' },
        { key: 'timezone.default', value: 'Asia/Dhaka' },
      ],
    },
    catalog: [contacts],
    activeModules: [],
    tenantConfiguration: [
      { key: 'locale.default', value: 'en-US', source: 'tenant', customized: true },
    ],
  });
  assert.equal(preview.ok, true);
  if (!preview.ok) return;
  assert.deepEqual(preview.changes, [{ key: 'timezone.default', value: 'Asia/Dhaka' }]);
  assert.deepEqual(preview.conflicts, [
    { key: 'locale.default', current: 'en-US', proposed: 'bn-BD' },
  ]);
});

test('manifest validation rejects schema deployment disguised as tenant setup', () => {
  const unsafe = {
    ...contacts,
    setupSteps: [{ key: 'schema.deploy', scope: 'global_schema' }],
  } as unknown as ModuleManifest;
  const plan = planModuleActivation({
    catalog: [unsafe],
    active: [],
    requested: [{ id: unsafe.id, version: unsafe.version }],
  });
  assert.equal(plan.ok, false);
  if (!plan.ok) assert.equal(plan.issues[0]?.code, 'invalid_manifest');
});

test('template preview rejects ambiguous current configuration state', () => {
  const preview = previewTemplateApplication({
    template: {
      id: 'template.retail',
      version: 1,
      status: 'published',
      modules: [],
      configuration: [{ key: 'locale.default', value: 'bn-BD' }],
    },
    catalog: [],
    activeModules: [],
    tenantConfiguration: [
      { key: 'locale.default', value: 'en-US', source: 'tenant', customized: true },
      { key: 'locale.default', value: 'bn-BD', source: 'template', customized: false },
    ],
  });
  assert.equal(preview.ok, false);
});
