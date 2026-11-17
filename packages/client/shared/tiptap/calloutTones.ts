export const CALLOUT_TONES = ['plain', 'info', 'tip', 'important', 'warning', 'danger'] as const

export type CalloutTone = (typeof CALLOUT_TONES)[number]

export const CALLOUT_TONE_LABELS: Record<CalloutTone, string> = {
  plain: 'Plain',
  info: 'Info',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  danger: 'Danger'
}

export const CALLOUT_ALERT_MARKERS: Record<CalloutTone, string> = {
  plain: 'PLAIN',
  info: 'NOTE',
  tip: 'TIP',
  important: 'IMPORTANT',
  warning: 'WARNING',
  danger: 'CAUTION'
}

export const CALLOUT_CHILD_TYPES = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'taskList',
  'codeBlock',
  'blockquote',
  'horizontalRule',
  'imageBlock',
  'fileBlock',
  'fileUpload'
] as const

const ALERT_TYPE_TONES: Record<string, CalloutTone> = {
  note: 'info',
  info: 'info',
  todo: 'info',
  tip: 'tip',
  hint: 'tip',
  success: 'tip',
  check: 'tip',
  done: 'tip',
  important: 'important',
  warning: 'warning',
  attention: 'warning',
  caution: 'danger',
  danger: 'danger',
  error: 'danger',
  bug: 'danger',
  failure: 'danger'
}

export const toCalloutTone = (value: unknown): CalloutTone =>
  CALLOUT_TONES.find((tone) => tone === value) ?? 'plain'

export const calloutToneFromAlertType = (type: string): CalloutTone =>
  ALERT_TYPE_TONES[type.toLowerCase()] ?? 'plain'
