const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

function readHtml(filename) {
  const filePath = path.join(rootDir, filename);
  assert.ok(fs.existsSync(filePath), `${filename} should exist`);
  return fs.readFileSync(filePath, 'utf8');
}

console.log('Running static page tests...');

const indexHtml = readHtml('index.html');
const productHtml = readHtml('product.html');

// 1. Valid HTML structure (rendering baseline)
assert.ok(indexHtml.includes('<!DOCTYPE html>'), 'index.html must start with DOCTYPE');
assert.ok(productHtml.includes('<!DOCTYPE html>'), 'product.html must start with DOCTYPE');
assert.ok(indexHtml.includes('<main>') && indexHtml.includes('</main>'), 'index.html must contain main content area');
assert.ok(productHtml.includes('<main>') && productHtml.includes('</main>'), 'product.html must contain main content area');

// 2. Product page content sections (purpose, features, value)
assert.ok(productHtml.includes('<h2>Purpose</h2>'), 'product.html must explain product purpose');
assert.ok(productHtml.includes('<h2>Core Features</h2>'), 'product.html must list core features');
assert.ok(productHtml.includes('<h2>Value Proposition</h2>'), 'product.html must state value proposition');

// 3. Navigation link (route accessibility)
assert.ok(indexHtml.includes('href="product.html"'), 'index.html must contain navigation link to product page');

// 4. Page metadata
assert.ok(productHtml.includes('<title>ai-dev — Product Overview</title>'), 'product.html must have correct title');

// 5. No broken internal links
const internalLinks = [...indexHtml.matchAll(/href="([^"]+)"/g), ...productHtml.matchAll(/href="([^"]+)"/g)]
  .map(m => m[1])
  .filter(link => !link.startsWith('http'));
internalLinks.forEach(link => {
  assert.ok(fs.existsSync(path.join(rootDir, link)), `Internal link ${link} should not be broken`);
});

// 6. Design system consistency (shared CSS variables)
const commonVars = [
  '--bg-primary', '--bg-secondary', '--text-primary', '--accent-gradient-start', '--border-color'
];
commonVars.forEach(variable => {
  assert.ok(indexHtml.includes(variable), 'index.html should use design system variable ' + variable);
  assert.ok(productHtml.includes(variable), 'product.html should use design system variable ' + variable);
});

// 7. Accessibility & console error prevention
assert.ok(!indexHtml.includes('onerror=') && !productHtml.includes('onerror='), 'Pages should not use inline event handlers that cause console errors');
assert.ok(indexHtml.includes('lang="en"') && productHtml.includes('lang="en"'), 'Pages should have valid lang attribute');

console.log('✅ All tests passed!');