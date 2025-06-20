import * as Y from 'yjs'

export function updateYDocNodes(
  doc: Y.Doc,
  nodeName: string,
  filters: Record<string, string | number | boolean>,
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
      if (depth < maxDepth) {
        const isDone = updateYDocFragment(child, depth + 1)
        if (isDone) return isDone
      }
      if (child.nodeName !== nodeName) continue
      const isMatch = Object.entries(filters).every(([key, value]) => {
        return child.getAttribute(key) === value
      })
      if (!isMatch) continue
      const idx = ascending ? i : children.length - 1 - i
      const result = callbackFn(child, idx, frag)
      if (result === 'EXIT_NODE') break
      if (result === 'DONE') return true
    }
  }
  updateYDocFragment(doc.getXmlFragment('default'), 0)
}
