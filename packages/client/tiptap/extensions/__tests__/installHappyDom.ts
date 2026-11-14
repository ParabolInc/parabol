import {Window} from 'happy-dom'

export const happyWindow = new Window({url: 'https://parabol.test/'})

// Radix and ProseMirror read these at import, so this module has to load first
const globals: Record<string, unknown> = {
  window: happyWindow,
  document: happyWindow.document,
  navigator: happyWindow.navigator,
  getComputedStyle: happyWindow.getComputedStyle.bind(happyWindow),
  getSelection: happyWindow.getSelection.bind(happyWindow),
  requestAnimationFrame: happyWindow.requestAnimationFrame.bind(happyWindow),
  cancelAnimationFrame: happyWindow.cancelAnimationFrame.bind(happyWindow),
  IS_REACT_ACT_ENVIRONMENT: true,
  __APP_VERSION__: 'test',
  __PRODUCTION__: false
}
for (const key of [
  'Node',
  'NodeFilter',
  'Element',
  'HTMLElement',
  'SVGElement',
  'MutationObserver',
  'ResizeObserver',
  'DOMParser',
  'MouseEvent',
  'ClipboardEvent',
  'PointerEvent',
  'KeyboardEvent',
  'Event',
  'CustomEvent'
] as const) {
  globals[key] = happyWindow[key]
}
for (const [key, value] of Object.entries(globals)) {
  Object.defineProperty(globalThis, key, {value, configurable: true, writable: true})
}
