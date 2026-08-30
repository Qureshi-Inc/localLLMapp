import '@testing-library/jest-dom';

process.env.NODE_ENV = 'development';

// Provide Web API globals for jsdom environment (Next.js API routes depend on these)
const gw = globalThis || global;

// TextEncoder/TextDecoder - needed by Next.js internals
const { TextEncoder, TextDecoder } = require('util');
gw.TextEncoder = TextEncoder;
if (typeof gw.TextDecoder === 'undefined') {
  gw.TextDecoder = TextDecoder;
}

// ReadableStream - needed by Next.js
const { ReadableStream } = require('stream/web');
gw.ReadableStream = ReadableStream;

// Fetch API - use undici for jsdom environment; load lazily to avoid cycle issues
if (typeof gw.fetch === 'undefined' || typeof gw.Request === 'undefined') {
  const d = require('undici');
  gw.fetch = d.fetch;
  gw.Request = d.Request;
  gw.Response = d.Response;
  gw.Headers = d.Headers;
  gw.FormData = d.FormData;
}
