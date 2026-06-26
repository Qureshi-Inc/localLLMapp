const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

console.log('Running workflow integration tests...');

const workflowPath = path.join(rootDir, '.github', 'workflows', 'opencode.yml');
assert.ok(fs.existsSync(workflowPath), 'opencode.yml workflow file should exist');

const workflowContent = fs.readFileSync(workflowPath, 'utf8');

// 1. Verify workflow runs on self-hosted runner
assert.ok(workflowContent.includes('runs-on: self-hosted'), 'Workflow should run on a self-hosted runner');

// 2. Verify no hardcoded API key or token in the workflow configuration (ignoring comments)
const forbiddenKeys = ['api_key', 'API_KEY', 'api-key', 'token:', 'secret:', 'auth_token'];
const lines = workflowContent.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#')) continue;
  for (const key of forbiddenKeys) {
    if (trimmed.includes(key)) {
      assert.fail(`Workflow should not contain hardcoded authentication: '${key}' found in: ${trimmed}`);
    }
  }
}

// 3. Verify documentation comment indicates local runner handles auth
assert.ok(
  workflowContent.includes('local runner') || workflowContent.includes('local runner\'s opencode config'),
  'Workflow should document that authentication is handled by the local runner'
);

// 4. Verify the opencode action step does not pass API credentials in its 'with' block
const opencodeStep = workflowContent.match(/- name: Run opencode[\s\S]*?uses: anomalyco\/opencode\/github@latest[\s\S]*?with:[\s\S]*?(?=\n  lint:|$)/);
assert.ok(opencodeStep, 'Opencode step should be present');
const opencodeWithBlock = opencodeStep[0];
assert.ok(!opencodeWithBlock.includes('api_key') && !opencodeWithBlock.includes('token'), 'Opencode step should not pass API credentials in with block');

console.log('✅ All workflow integration tests passed!');