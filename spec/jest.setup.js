// The jsdom test environment doesn't expose several web APIs which our
// dependencies (in particular undici, via inline-css) rely upon, so we
// polyfill them using Node.js' implementations here.
const { TextDecoder, TextEncoder } = require("util");
const { ReadableStream, WritableStream, TransformStream } = require("stream/web");
const { MessageChannel, MessagePort } = require("worker_threads");

Object.assign(globalThis, {
    TextDecoder,
    TextEncoder,
    ReadableStream,
    WritableStream,
    TransformStream,
    MessageChannel,
    MessagePort,
});
