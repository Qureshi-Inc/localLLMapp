import '@testing-library/jest-dom';

process.env.NODE_ENV = 'development';

// Provide Web API globals for jsdom environment (Next.js API routes depend on these)
const gw = globalThis || global;

// TextEncoder/TextDecoder — needed by some env shims
if (typeof gw.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  gw.TextEncoder = TextEncoder;
  gw.TextDecoder = TextDecoder;
}

// ReadableStream — needed by fetch/polyfill chain
if (typeof gw.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web');
  gw.ReadableStream = ReadableStream;
}

// TextEncoder/TextDecoder from util
if (typeof gw.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  gw.TextEncoder = TextEncoder;
  gw.TextDecoder = TextDecoder;
}

// Fetch API globals — Node.js 18+ already has these on globalThis
if (typeof gw.Request === 'undefined') {
  gw.Request = Request;
  gw.Response = Response;
  gw.Headers = Headers;
  gw.FormData = FormData;
  gw.fetch = fetch;
}
