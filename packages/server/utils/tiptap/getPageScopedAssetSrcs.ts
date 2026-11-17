import * as Y from 'yjs'
import {PAGE_ASSET_ATTRS} from './pageAssetAttrs'

export const getAssetAttr = (node: unknown) =>
  node instanceof Y.XmlElement ? PAGE_ASSET_ATTRS.get(node.nodeName) : undefined

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
  for (const node of doc
    .getXmlFragment('default')
    .createTreeWalker((yxml) => !!getAssetAttr(yxml))) {
    const attr = getAssetAttr(node)
    if (!attr || !(node instanceof Y.XmlElement)) continue
    const src = node.getAttribute(attr)
    if (typeof src === 'string' && isPageScopedSrc(src, pageCode)) srcs.add(src)
  }
  return [...srcs]
}
