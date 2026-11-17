import * as Y from 'yjs'
import appOrigin from '../../appOrigin'
import {isParabolHostedAsset} from '../../fileStorage/isParabolHostedAsset'
import {getPageAssetAttr} from './getPageAssetAttr'

const isPageScopedSrc = (src: string, pageCode: number) =>
  isParabolHostedAsset(src) &&
  new URL(src, appOrigin).pathname.startsWith(`/assets/Page/${pageCode}/`)

export const getPageScopedAssetSrcs = (state: Uint8Array, pageCode: number): string[] => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  const srcs = new Set<string>()
  const assetNodes = doc
    .getXmlFragment('default')
    .createTreeWalker((node) => !!getPageAssetAttr(node))
  for (const node of assetNodes) {
    const attr = getPageAssetAttr(node)
    if (!attr || !(node instanceof Y.XmlElement)) continue
    const src = node.getAttribute(attr)
    if (typeof src === 'string' && isPageScopedSrc(src, pageCode)) srcs.add(src)
  }
  return [...srcs]
}
