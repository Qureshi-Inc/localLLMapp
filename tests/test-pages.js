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
const pricingHtml = readHtml('pricing.html');

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
const internalLinks = [...indexHtml.matchAll(/href="([^"]+)"/g), ...productHtml.matchAll(/href="([^"]+)"/g), ...pricingHtml.matchAll(/href="([^"]+)"/g)]
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
  assert.ok(pricingHtml.includes(variable), 'pricing.html should use design system variable ' + variable);
});

// 7. Accessibility & console error prevention
assert.ok(!indexHtml.includes('onerror=') && !productHtml.includes('onerror=') && !pricingHtml.includes('onerror='), 'Pages should not use inline event handlers that cause console errors');
assert.ok(indexHtml.includes('lang="en"') && productHtml.includes('lang="en"') && pricingHtml.includes('lang="en"'), 'Pages should have valid lang attribute');

// 8. Pricing page structure & content
assert.ok(pricingHtml.includes('<!DOCTYPE html>'), 'pricing.html must start with DOCTYPE');
assert.ok(pricingHtml.includes('<main>') && pricingHtml.includes('</main>'), 'pricing.html must contain main content area');
assert.ok(pricingHtml.includes('<h1>Simple, Transparent Pricing</h1>'), 'pricing.html must have pricing hero title');
assert.ok(pricingHtml.includes('class="pricing-grid"'), 'pricing.html must contain pricing grid');
assert.ok(pricingHtml.includes('class="pricing-card"'), 'pricing.html must contain pricing cards');
assert.ok(pricingHtml.includes('Starter') && pricingHtml.includes('Pro') && pricingHtml.includes('Enterprise'), 'pricing.html must list all plans');
assert.ok(pricingHtml.includes('class="cta-section"'), 'pricing.html must contain CTA section');

// 9. Header & Navbar functionality (shared across pages)
const pages = [indexHtml, productHtml, pricingHtml];
pages.forEach((html, i) => {
  const pageName = ['index.html', 'product.html', 'pricing.html'][i];
  assert.ok(html.includes('class="menu-toggle"'), `${pageName} must have menu toggle button`);
  assert.ok(html.includes('aria-label="Toggle navigation"'), `${pageName} must have accessible menu toggle`);
  assert.ok(html.includes('id="nav-menu"'), `${pageName} must have nav menu with id`);
  assert.ok(html.includes('aria-label="Main navigation"'), `${pageName} must have accessible nav label`);
  assert.ok(html.includes('class="nav-link"'), `${pageName} must have navigation links`);
});

// 10. Sign-up flow & CTA elements
assert.ok(pricingHtml.includes('href="#signup"'), 'pricing.html must contain sign-up flow anchor');
assert.ok(pricingHtml.includes('Sign Up Today') || pricingHtml.includes('Start Free Trial'), 'pricing.html must have sign-up call-to-action');
assert.ok(pricingHtml.includes('class="btn"'), 'pricing.html must have interactive buttons for sign-up flow');

console.log('✅ All tests passed!');