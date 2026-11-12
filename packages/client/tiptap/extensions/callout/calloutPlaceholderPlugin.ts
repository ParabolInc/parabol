import type {Node} from '@tiptap/pm/model'
import {Plugin, PluginKey} from '@tiptap/pm/state'
import {Decoration, DecorationSet} from '@tiptap/pm/view'

const calloutPlaceholderKey = new PluginKey<DecorationSet>('calloutPlaceholder')

const decorateLoneEmptyBodies = (doc: Node) => {
  const decorations: Decoration[] = []
  doc.descendants((node, pos) => {
    if (node.isTextblock) return false
    if (node.type.name !== 'callout') return true
    const body = node.lastChild
    const bodyCount = node.childCount - (node.firstChild?.type.name === 'calloutTitle' ? 1 : 0)
    if (bodyCount === 1 && body?.type.name === 'paragraph' && body.content.size === 0) {
      const from = pos + 1 + node.content.size - body.nodeSize
      decorations.push(
        Decoration.node(from, from + body.nodeSize, {'data-callout-placeholder': 'New callout'})
      )
    }
    return true
  })
  return DecorationSet.create(doc, decorations)
}

export const calloutPlaceholderPlugin = () =>
  new Plugin<DecorationSet>({
    key: calloutPlaceholderKey,
    state: {
      init: (_, {doc}) => decorateLoneEmptyBodies(doc),
      apply: (tr, decorations) => (tr.docChanged ? decorateLoneEmptyBodies(tr.doc) : decorations)
    },
    props: {
      decorations: (state) => calloutPlaceholderKey.getState(state)
    }
  })
