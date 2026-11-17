const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])'
].join(', ')

export const isFocusableTarget = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest(FOCUSABLE)
