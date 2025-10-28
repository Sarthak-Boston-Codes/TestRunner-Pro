const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Fix setImmediate for jsdom
if (typeof setImmediate === 'undefined') {
  global.setImmediate = setTimeout;
}