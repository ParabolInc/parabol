import type {Node} from '@tiptap/pm/model'
import type {EditorView} from '@tiptap/pm/view'
import {type BlockRange, isBlockUnit, isUnitContainer, isUnitParent} from './blockUnits'

export type UnitBox = {
  from: number
  to: number
  top: number
  bottom: number
  left: number
  right: number
}

export type MarqueeRect = {top: number; bottom: number; left: number; right: number}

export const getUnitBoxes = (view: EditorView): UnitBox[] => {
  const boxes: UnitBox[] = []
  view.state.doc.descendants((node, pos, parent, index) => {
    if (parent && isBlockUnit(node, parent, index)) {
      const dom = view.nodeDOM(pos)
      if (dom instanceof Element) {
        const {top, bottom, left, right} = dom.getBoundingClientRect()
        if (bottom > top && right > left) {
          boxes.push({from: pos, to: pos + node.nodeSize, top, bottom, left, right})
        }
      }
    }
    return isUnitContainer(node)
  })
  return boxes
}

const isWithin = (inner: UnitBox, outer: UnitBox) =>
  inner !== outer && outer.from <= inner.from && inner.to <= outer.to

const touchesOwnArea = (unit: UnitBox, units: readonly UnitBox[], rect: MarqueeRect) => {
  const children = units.filter((other) => isWithin(other, unit))
  if (children.length === 0) return true
  const childrenTop = Math.min(...children.map(({top}) => top))
  const childrenBottom = Math.max(...children.map(({bottom}) => bottom))
  return rect.top < childrenTop || rect.bottom > childrenBottom
}

export const getBlocksInRect = (units: readonly UnitBox[], rect: MarqueeRect) => {
  const touched = units
    .filter(
      (unit) =>
        unit.top < rect.bottom &&
        unit.bottom > rect.top &&
        unit.left < rect.right &&
        unit.right > rect.left
    )
    .sort((a, b) => a.from - b.from)
  const kept = touched.filter(
    (unit) => !touched.some((other) => isWithin(other, unit)) || touchesOwnArea(unit, units, rect)
  )
  const first = kept[0]
  const last = kept[kept.length - 1]
  return first && last ? {first, last} : null
}

type Span = {from: number; to: number}

export const getRunFromBoxes = (
  doc: Node,
  first: Span,
  last: Span,
  anchor?: Span | null
): BlockRange | null => {
  const from = Math.min(first.from, anchor?.from ?? Infinity)
  const to = Math.max(last.to, anchor?.to ?? -Infinity)
  const run = doc.resolve(from).blockRange(doc.resolve(to), isUnitParent)
  return run ? {from: run.start, to: run.end, depth: run.depth} : null
}

export const isRunBackward = (run: BlockRange, anchor: Span) =>
  run.from < anchor.from && run.to <= anchor.to
