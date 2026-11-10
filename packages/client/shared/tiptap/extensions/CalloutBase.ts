import {Node} from '@tiptap/core'
import {
  calloutMarkdownTokenizer,
  parseCalloutMarkdown,
  renderCalloutMarkdown
} from '../calloutMarkdown'
import {
  CALLOUT_CHILD_TYPES,
  CALLOUT_TONE_LABELS,
  calloutToneFromAlertType,
  toCalloutTone
} from '../calloutTones'

const ALERT_CLASS_PREFIX = 'markdown-alert-'

const getAlertType = (element: HTMLElement) => {
  const alertClass = Array.from(element.classList).find(
    (className) => className.startsWith(ALERT_CLASS_PREFIX) && className !== 'markdown-alert-title'
  )
  return alertClass?.slice(ALERT_CLASS_PREFIX.length) ?? ''
}

export const CalloutBase = Node.create({
  name: 'callout',

  group: 'block',

  content: `calloutTitle? (${CALLOUT_CHILD_TYPES.join(' | ')})+`,

  defining: true,

  addAttributes() {
    return {
      tone: {
        default: 'plain',
        parseHTML: (element: HTMLElement) =>
          element.classList.contains('markdown-alert')
            ? calloutToneFromAlertType(getAlertType(element))
            : toCalloutTone(element.getAttribute('data-tone')),
        renderHTML: (attributes) => ({'data-tone': toCalloutTone(attributes.tone)})
      },
      emoji: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-emoji'),
        renderHTML: (attributes) => (attributes.emoji ? {'data-emoji': attributes.emoji} : {})
      }
    }
  },

  parseHTML() {
    return [
      {tag: 'div[data-type="callout"]'},
      {
        tag: 'div.markdown-alert',
        contentElement: (element) => {
          const clone = element.cloneNode(true) as HTMLElement
          clone.querySelector('.markdown-alert-title')?.remove()
          return clone
        }
      }
    ]
  },

  renderHTML({HTMLAttributes, node}) {
    const label = CALLOUT_TONE_LABELS[toCalloutTone(node.attrs.tone)]
    return [
      'div',
      {...HTMLAttributes, 'data-type': 'callout', role: 'note', 'aria-label': label},
      0
    ]
  },

  markdownTokenName: 'callout',

  markdownTokenizer: calloutMarkdownTokenizer,

  parseMarkdown: parseCalloutMarkdown,

  renderMarkdown: renderCalloutMarkdown
})
