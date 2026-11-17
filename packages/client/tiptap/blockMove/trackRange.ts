import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import * as Y from 'yjs'

export type TrackedRange = {
  current(): {from: number; to: number} | null
  stop(): void
}

type Range = {from: number; to: number}

const trackWithMapping = (editor: Editor, from: number, to: number): TrackedRange => {
  let range: Range | null = {from, to}
  const onTransaction = ({
    transaction
  }: {
    transaction: {mapping: Editor['state']['tr']['mapping']}
  }) => {
    if (!range) return
    if (range.from === range.to) {
      const mappedPoint = transaction.mapping.mapResult(range.from, -1)
      range = mappedPoint.deletedAcross ? null : {from: mappedPoint.pos, to: mappedPoint.pos}
      return
    }
    const mappedFrom = transaction.mapping.mapResult(range.from, 1)
    const mappedTo = transaction.mapping.mapResult(range.to, -1)
    range =
      mappedFrom.deleted || mappedTo.deleted || mappedFrom.pos > mappedTo.pos
        ? null
        : {from: mappedFrom.pos, to: mappedTo.pos}
  }
  editor.on('transaction', onTransaction)
  return {
    current: () => range,
    stop: () => {
      editor.off('transaction', onTransaction)
    }
  }
}

const isYParent = (type: unknown): type is Y.XmlFragment | Y.XmlElement =>
  type instanceof Y.XmlElement || type instanceof Y.XmlFragment

const findYParent = (root: Y.XmlFragment, doc: Node, from: number) => {
  const $from = doc.resolve(from)
  let type: Y.XmlFragment | Y.XmlElement = root
  for (let depth = 0; depth < $from.depth; depth++) {
    const child: unknown = type.get($from.index(depth))
    if (!isYParent(child)) return null
    type = child
  }
  return type
}

const isLive = (type: Y.AbstractType<unknown>) => {
  let current: Y.AbstractType<unknown> | null = type
  while (current?._item) {
    if (current._item.deleted) return false
    current = current._item.parent as Y.AbstractType<unknown> | null
  }
  return current !== null
}

const liveIndexOf = (item: Y.Item) => {
  let index = 0
  for (let left = item.left; left; left = left.left) {
    if (!left.deleted && left.countable) index += left.length
  }
  return index
}

const toProseMirrorPosition = (
  root: Y.XmlFragment,
  doc: Node,
  type: Y.AbstractType<unknown>,
  index: number
) => {
  if (!isLive(type)) return null
  const path: number[] = []
  for (let current = type; current !== root; ) {
    const item = current._item
    if (!item) return null
    path.unshift(liveIndexOf(item))
    current = item.parent as Y.AbstractType<unknown>
  }
  let node = doc
  let pos = 0
  for (const childIndex of path) {
    if (childIndex >= node.childCount) return null
    for (let i = 0; i < childIndex; i++) pos += node.child(i).nodeSize
    node = node.child(childIndex)
    pos += 1
  }
  if (index > node.childCount) return null
  for (let i = 0; i < index; i++) pos += node.child(i).nodeSize
  return pos
}

const trackWithRelativePositions = (
  editor: Editor,
  parent: Y.XmlFragment | Y.XmlElement,
  startIndex: number,
  endIndex: number
): TrackedRange => {
  const isGap = startIndex === endIndex
  const anchors: Y.RelativePosition[] = isGap
    ? [
        ...(startIndex > 0 ? [Y.createRelativePositionFromTypeIndex(parent, startIndex, -1)] : []),
        ...(startIndex < parent.length
          ? [Y.createRelativePositionFromTypeIndex(parent, startIndex, 0)]
          : []),
        ...(parent.length === 0 ? [Y.createRelativePositionFromTypeIndex(parent, 0, 0)] : [])
      ]
    : [
        Y.createRelativePositionFromTypeIndex(parent, startIndex, 0),
        Y.createRelativePositionFromTypeIndex(parent, endIndex, -1)
      ]
  let lost = false
  const resolve = (relativePosition: Y.RelativePosition) => {
    const binding = ySyncPluginKey.getState(editor.state)?.binding
    if (!binding) return null
    const absolute = Y.createAbsolutePositionFromRelativePosition(relativePosition, binding.doc)
    if (!absolute) return null
    return toProseMirrorPosition(binding.type, editor.state.doc, absolute.type, absolute.index)
  }
  return {
    current: () => {
      if (lost) return null
      if (isGap) {
        for (const anchor of anchors) {
          const pos = resolve(anchor)
          if (pos !== null) return {from: pos, to: pos}
        }
        lost = true
        return null
      }
      const resolvedFrom = resolve(anchors[0]!)
      const resolvedTo = resolve(anchors[1]!)
      if (resolvedFrom === null || resolvedTo === null || resolvedFrom >= resolvedTo) {
        lost = true
        return null
      }
      return {from: resolvedFrom, to: resolvedTo}
    },
    stop: () => {}
  }
}

export const trackRange = (editor: Editor, from: number, to: number): TrackedRange => {
  const binding = ySyncPluginKey.getState(editor.state)?.binding
  if (binding) {
    const {doc} = editor.state
    const $from = doc.resolve(from)
    const $to = doc.resolve(to)
    const parent = $from.parent.inlineContent ? null : findYParent(binding.type, doc, from)
    if (parent && $from.sameParent($to)) {
      return trackWithRelativePositions(editor, parent, $from.index(), $to.index())
    }
  }
  return trackWithMapping(editor, from, to)
}
