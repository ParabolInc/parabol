import type {Editor} from '@tiptap/core'
import {Extension} from '@tiptap/core'
import type {Node as ProseMirrorNode, ResolvedPos} from '@tiptap/pm/model'
import type {Transaction} from '@tiptap/pm/state'
import {Plugin, PluginKey} from '@tiptap/pm/state'
import {Decoration, DecorationSet} from '@tiptap/pm/view'

export const INSERTED_HIGHLIGHT_CLASS = 'rounded bg-sky-500/18 transition-colors duration-[1200ms]'
export const INSERTED_SETTLED_CLASS = 'rounded bg-transparent transition-colors duration-[1200ms]'

interface TrackedRange {
  from: number
  to: number
  settled: boolean
}

export interface RestoredRange extends TrackedRange {
  id: string
}

type RangeMap = Map<string, TrackedRange>

interface RangeMeta {
  mark?: {id: string; from: number; to: number}
  restore?: RestoredRange[]
  settle?: string
  forget?: string
}

export const insertedRangeKey = new PluginKey<RangeMap>('insertedRangeHighlight')

const clampToDoc = (position: number, size: number) => Math.max(0, Math.min(position, size))

const insideStart = (doc: ProseMirrorNode, from: number) => {
  let position = clampToDoc(from + 1, doc.content.size)
  let $position = doc.resolve(position)
  if ($position.depth === 0) return null
  while ($position.nodeAfter && !$position.nodeAfter.isLeaf) {
    position += 1
    $position = doc.resolve(position)
  }
  return position
}

const insideEnd = (doc: ProseMirrorNode, to: number) => {
  let position = clampToDoc(to - 1, doc.content.size)
  let $position = doc.resolve(position)
  if ($position.depth === 0) return null
  while ($position.nodeBefore && !$position.nodeBefore.isLeaf) {
    position -= 1
    $position = doc.resolve(position)
  }
  return position
}

const startOfBoundedBlock = ($anchor: ResolvedPos) => {
  let depth = $anchor.depth
  while (depth > 1 && $anchor.before(depth) === $anchor.before(depth - 1) + 1) depth -= 1
  return $anchor.before(depth)
}

const endOfBoundedBlock = ($anchor: ResolvedPos) => {
  let depth = $anchor.depth
  while (depth > 1 && $anchor.after(depth) === $anchor.after(depth - 1) - 1) depth -= 1
  return $anchor.after(depth)
}

const mapRangeStart = (tr: Transaction, from: number) => {
  const size = tr.doc.content.size
  const boundary = clampToDoc(tr.mapping.map(from, 1), size)
  const anchor = insideStart(tr.before, from)
  if (anchor === null) return boundary
  const mapped = clampToDoc(tr.mapping.map(anchor, 1), size)
  const $mapped = tr.doc.resolve(mapped)
  return $mapped.depth === 0 ? mapped : Math.max(startOfBoundedBlock($mapped), boundary)
}

const mapRangeEnd = (tr: Transaction, to: number) => {
  const size = tr.doc.content.size
  const anchor = insideEnd(tr.before, to)
  const mapped = clampToDoc(tr.mapping.map(anchor ?? to, -1), size)
  if (anchor === null) return mapped
  const $mapped = tr.doc.resolve(mapped)
  return $mapped.depth === 0 ? mapped : endOfBoundedBlock($mapped)
}

const setClampedRange = (ranges: RangeMap, size: number, range: RestoredRange) => {
  const from = clampToDoc(range.from, size)
  const to = clampToDoc(range.to, size)
  if (to > from) ranges.set(range.id, {from, to, settled: range.settled})
  else ranges.delete(range.id)
}

const buildDecorations = (doc: Parameters<typeof DecorationSet.create>[0], ranges: RangeMap) => {
  const decorations: Decoration[] = []
  ranges.forEach((range, id) => {
    doc.nodesBetween(range.from, range.to, (node, pos) => {
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
      restoreInsertedRanges: (ranges: RestoredRange[]) => ReturnType
      settleInsertedRange: (id: string) => ReturnType
      forgetInsertedRange: (id: string) => ReturnType
    }
  }
}

export const getInsertedRanges = (editor: Editor): RangeMap =>
  new Map(insertedRangeKey.getState(editor.state) ?? [])

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
      restoreInsertedRanges:
        (ranges) =>
        ({tr, dispatch}) => {
          if (dispatch) tr.setMeta(insertedRangeKey, {restore: ranges} satisfies RangeMeta)
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
            const size = tr.doc.content.size
            const next: RangeMap = new Map()
            ranges.forEach((range, id) => {
              const from = clampToDoc(mapRangeStart(tr, range.from), size)
              const to = clampToDoc(mapRangeEnd(tr, range.to), size)
              if (to > from) next.set(id, {from, to, settled: range.settled})
            })
            const meta = tr.getMeta(insertedRangeKey) as RangeMeta | undefined
            if (meta?.mark) setClampedRange(next, size, {...meta.mark, settled: false})
            meta?.restore?.forEach((range) => setClampedRange(next, size, range))
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
