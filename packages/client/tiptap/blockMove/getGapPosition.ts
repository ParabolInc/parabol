import type {Node} from '@tiptap/pm/model'
import type {TrackedRange} from './trackRange'

const isBlockBoundary = (doc: Node, pos: number) =>
  pos >= 0 && pos <= doc.content.size && !doc.resolve(pos).parent.inlineContent

export const getGapPosition = (doc: Node, gap: TrackedRange | undefined) => {
  const gapPosition = gap?.current()?.from
  return gapPosition !== undefined && isBlockBoundary(doc, gapPosition)
    ? gapPosition
    : doc.content.size
}
