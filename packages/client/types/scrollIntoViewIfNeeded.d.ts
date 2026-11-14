// Non-standard & webkit-only, polyfilled by client/scrollIntoViewIfNeeded.js
interface Element {
  scrollIntoViewIfNeeded(centerIfNeeded?: boolean): void
}
