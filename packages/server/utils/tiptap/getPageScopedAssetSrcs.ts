import * as Y from 'yjs'

export const isAssetBlock = (node: unknown): node is Y.XmlElement<{src?: string}> =>
  node instanceof Y.XmlElement && (node.nodeName === 'imageBlock' || node.nodeName === 'fileBlock')

const isPageScopedSrc = (src: string, pageCode: number) => {
  try {
    return new URL(src).pathname.startsWith(`/assets/Page/${pageCode}/`)
  } catch {
    return false
  }
}

export const getPageScopedAssetSrcs = (state: Uint8Array, pageCode: number): string[] => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  const srcs = new Set<string>()
  for (const node of doc.getXmlFragment('default').createTreeWalker(isAssetBlock)) {
    if (!isAssetBlock(node)) continue
    const src = node.getAttribute('src')
    if (src && isPageScopedSrc(src, pageCode)) srcs.add(src)
  }
  return [...srcs]
}
