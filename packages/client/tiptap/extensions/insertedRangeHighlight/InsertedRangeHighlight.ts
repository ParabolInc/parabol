import type {Editor} from '@tiptap/core'
import {Extension} from '@tiptap/core'
import {Plugin, PluginKey} from '@tiptap/pm/state'
import {Decoration, DecorationSet} from '@tiptap/pm/view'

export const INSERTED_HIGHLIGHT_CLASS = 'rounded bg-sky-500/18 transition-colors duration-[1200ms]'
export const INSERTED_SETTLED_CLASS = 'rounded bg-transparent transition-colors duration-[1200ms]'

interface TrackedRange {
  from: number
  to: number
  settled: boolean
}

type RangeMap = Map<string, TrackedRange>

interface RangeMeta {
  mark?: {id: string; from: number; to: number}
  settle?: string
  forget?: string
}

export const insertedRangeKey = new PluginKey<RangeMap>('insertedRangeHighlight')

const buildDecorations = (doc: Parameters<typeof DecorationSet.create>[0], ranges: RangeMap) => {
  const decorations: Decoration[] = []
  ranges.forEach((range, id) => {
    doc.nodesBetween(range.from, range.to, (node, pos, parent) => {
      if (parent?.type.name !== 'doc') return true
      if (pos < range.from || pos + node.nodeSize > range.to) return false
      decorations.push(
        Decoration.node(pos, pos + node.nodeSize, {
          class: range.settled ? INSERTED_SETTLED_CLASS : INSERTED_HIGHLIGHT_CLASS,
          'data-sr-added': range.settled ? 'settled' : id
        })
      )
      return false
    })
  })
  return DecorationSet.create(doc, decorations)
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertedRangeHighlight: {
      markInsertedRange: (id: string, from: number, to: number) => ReturnType
      settleInsertedRange: (id: string) => ReturnType
      forgetInsertedRange: (id: string) => ReturnType
    }
  }
}

export const getInsertedRange = (editor: Editor, id: string) => {
  const range = insertedRangeKey.getState(editor.state)?.get(id)
  return range ? {from: range.from, to: range.to} : null
}

export const InsertedRangeHighlight = Extension.create({
  name: 'insertedRangeHighlight',

  addCommands() {
    return {
      markInsertedRange:
        (id, from, to) =>
        ({tr, dispatch}) => {
          if (dispatch) tr.setMeta(insertedRangeKey, {mark: {id, from, to}} satisfies RangeMeta)
          return true
        },
      settleInsertedRange:
        (id) =>
        ({tr, dispatch}) => {
          if (dispatch) tr.setMeta(insertedRangeKey, {settle: id} satisfies RangeMeta)
          return true
        },
      forgetInsertedRange:
        (id) =>
        ({tr, dispatch}) => {
          if (dispatch) tr.setMeta(insertedRangeKey, {forget: id} satisfies RangeMeta)
          return true
        }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<RangeMap>({
        key: insertedRangeKey,
        state: {
          init: () => new Map(),
          apply: (tr, ranges) => {
            const next: RangeMap = new Map()
            ranges.forEach((range, id) => {
              next.set(id, {
                from: tr.mapping.map(range.from, -1),
                to: tr.mapping.map(range.to, 1),
                settled: range.settled
              })
            })
            const meta = tr.getMeta(insertedRangeKey) as RangeMeta | undefined
            if (meta?.mark)
              next.set(meta.mark.id, {from: meta.mark.from, to: meta.mark.to, settled: false})
            if (meta?.settle) {
              const range = next.get(meta.settle)
              if (range) next.set(meta.settle, {...range, settled: true})
            }
            if (meta?.forget) next.delete(meta.forget)
            return next
          }
        },
        props: {
          decorations(state) {
            const ranges = this.getState(state)
            if (!ranges || ranges.size === 0) return DecorationSet.empty
            return buildDecorations(state.doc, ranges)
          }
        }
      })
    ]
  }
})
