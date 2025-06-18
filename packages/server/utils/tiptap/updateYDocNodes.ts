import * as Y from 'yjs'

export function updateYDocNodes(
  doc: Y.Doc,
  nodeName: string,
  filters: Record<string, string | number | boolean>,
  updates: Record<string, string | number | boolean>
) {
  const updateYDocFragment = (frag: Y.XmlFragment) => {
    for (const child of frag.toArray()) {
      if (!(child instanceof Y.XmlElement)) continue
      // the typings aren't coming through using an identity fn, so casting to a new variable
      const childEl = child as Y.XmlElement<{[key: string]: string | number | boolean}>
      updateYDocFragment(childEl)
      if (childEl.nodeName !== nodeName) continue
      const isMatch = Object.entries(filters).every(([key, value]) => {
        return childEl.getAttribute(key) === value
      })
      if (!isMatch) continue
      Object.entries(updates).forEach(([key, value]) => {
        childEl.setAttribute(key, value)
      })
    }
  }
  updateYDocFragment(doc.getXmlFragment('default'))
}
