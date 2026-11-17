import {InputRule} from '@tiptap/core'
import type {Node, NodeType} from '@tiptap/pm/model'
import {calloutToneFromAlertType} from '../../../shared/tiptap/calloutTones'

const findQuoteToConvert = (doc: Node, markerPos: number, type: NodeType) => {
  const $marker = doc.resolve(markerPos)
  if ($marker.depth < 2) return null
  const quote = $marker.node(-1)
  if (quote.type.name !== 'blockquote' || $marker.index(-1) !== 0) return null
  if (!type.validContent(quote.content)) return null
  const quotePos = $marker.before(-1)
  const $quote = doc.resolve(quotePos)
  const index = $quote.index()
  return $quote.parent.canReplaceWith(index, index + 1, type) ? quotePos : null
}

export const calloutInputRule = (type: NodeType) =>
  new InputRule({
    find: /^\[!([A-Za-z]+)\]\s$/,
    handler: ({state, range, match}) => {
      const quotePos = findQuoteToConvert(state.doc, range.from, type)
      if (quotePos === null) return
      state.tr
        .delete(range.from, range.to)
        .setNodeMarkup(quotePos, type, {tone: calloutToneFromAlertType(match[1] ?? '')})
    }
  })
