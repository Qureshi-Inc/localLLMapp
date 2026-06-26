const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

console.log('Running Docker build integration tests...');

const dockerfilePath = path.join(rootDir, 'apps', 'taskpulse', 'Dockerfile');
assert.ok(fs.existsSync(dockerfilePath), 'apps/taskpulse/Dockerfile should exist');

const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');

// 1. Verify npm install is used instead of npm ci
assert.ok(dockerfileContent.includes('npm install'), 'Dockerfile should use npm install for dependency installation');
assert.ok(!dockerfileContent.includes('npm ci'), 'Dockerfile should not use npm ci');

// 2. Verify COPY command handles missing package-lock.json gracefully
assert.ok(dockerfileContent.includes('COPY package.json package-lock.json*'), 'Dockerfile COPY command should handle missing package-lock.json');

// 3. Verify standard Next.js Docker structure
assert.ok(dockerfileContent.includes('FROM node:20-alpine AS base'), 'Dockerfile should use node:20-alpine base image');
assert.ok(dockerfileContent.includes('WORKDIR /app'), 'Dockerfile should set working directory to /app');
assert.ok(dockerfileContent.includes('EXPOSE 3000'), 'Dockerfile should expose port 3000');
assert.ok(dockerfileContent.includes('CMD ["node", "server.js"]'), 'Dockerfile should run Next.js standalone server');

console.log('✅ All Docker build integration tests passed!');