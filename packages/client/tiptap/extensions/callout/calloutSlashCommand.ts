import type {Editor} from '@tiptap/core'
import {
  CALLOUT_TONE_LABELS,
  CALLOUT_TONES,
  type CalloutTone
} from '../../../shared/tiptap/calloutTones'
import {CALLOUT_TONE_STYLES} from './calloutToneStyles'

const TONE_DESCRIPTIONS: Record<Exclude<CalloutTone, 'plain'>, string> = {
  info: 'Give readers the background they need',
  tip: 'Share a better way to do something',
  important: 'Point out what readers must not miss',
  warning: 'Flag a risk or a deadline',
  danger: "Warn about harm or a step that can't be undone"
}

const MIN_QUERY_LENGTH = 3

export const calloutForQuery = (query: string) => {
  const normalized = query.trim().toLowerCase()
  if (normalized.length < MIN_QUERY_LENGTH) return null
  const tone = CALLOUT_TONES.find(
    (candidate) =>
      candidate !== 'plain' && CALLOUT_TONE_LABELS[candidate].toLowerCase().startsWith(normalized)
  )
  if (!tone || tone === 'plain') return null
  return {
    title: `${CALLOUT_TONE_LABELS[tone]} callout`,
    description: TONE_DESCRIPTIONS[tone],
    icon: CALLOUT_TONE_STYLES[tone].Icon,
    action: (editor: Editor) => editor.chain().focus().setCallout({tone}).run()
  }
}
