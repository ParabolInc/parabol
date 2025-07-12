import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'

interface NodeAttributes {
  pageLinkBlock: PageLinkBlockAttributes
}
export function updateYDocNodes<T extends keyof NodeAttributes>(
  doc: Y.Doc,
  nodeName: T,
  filters: Partial<NodeAttributes[T]>,
  callbackFn: (
    node: Y.XmlElement,
    idx: number,
    parent: Y.XmlElement | Y.XmlFragment
  ) => 'EXIT_NODE' | 'DONE' | void,
  options?: {maxDepth?: number; ascending?: boolean}
  // 0 for nodes that are top-level on the document
) {
  const maxDepth = options?.maxDepth ?? 1000
  const ascending = options?.ascending ?? true
  const updateYDocFragment = (frag: Y.XmlFragment, depth: number): true | void => {
    const children = ascending ? frag.toArray() : frag.toArray().reverse()
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (!(child instanceof Y.XmlElement)) continue
      if (child.nodeName !== nodeName) continue
      const isMatch = Object.entries(filters).every(([key, value]) => {
        return child.getAttribute(key) === value
      })
      if (!isMatch) continue
      const idx = ascending ? i : children.length - 1 - i
      const result = callbackFn(child, idx, frag)
      if (result === 'EXIT_NODE') break
      if (result === 'DONE') return true
      // Important that this comes last. This mimics a "onEnter" visitor pattern
      if (depth < maxDepth) {
        const isDone = updateYDocFragment(child, depth + 1)
        if (isDone) return isDone
      }
    }
  }
  updateYDocFragment(doc.getXmlFragment('default'), 0)
}
