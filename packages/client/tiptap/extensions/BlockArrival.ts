import {Extension} from '@tiptap/core'
import {Plugin, PluginKey} from '@tiptap/pm/state'
import {Decoration, DecorationSet, type EditorView} from '@tiptap/pm/view'

const blockArrivalKey = new PluginKey<DecorationSet>('blockArrival')

const setArrival = (view: EditorView, positions: number[] | null) => {
  view.dispatch(view.state.tr.setMeta(blockArrivalKey, positions).setMeta('addToHistory', false))
}

export const showBlockArrival = (view: EditorView, positions: number[]) =>
  setArrival(view, positions)
export const clearBlockArrival = (view: EditorView) => setArrival(view, null)

export const BlockArrival = Extension.create({
  name: 'blockArrival',
  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: blockArrivalKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, set) => {
            const positions: number[] | null | undefined = tr.getMeta(blockArrivalKey)
            if (positions === null) return DecorationSet.empty
            if (!positions) return set.map(tr.mapping, tr.doc)
            const decorations = positions.flatMap((pos) => {
              const node = pos >= 0 && pos < tr.doc.content.size ? tr.doc.nodeAt(pos) : null
              return node
                ? [Decoration.node(pos, pos + node.nodeSize, {class: 'block-arrived'})]
                : []
            })
            return DecorationSet.create(tr.doc, decorations)
          }
        },
        props: {
          decorations: (state) => blockArrivalKey.getState(state)
        }
      })
    ]
  }
})
