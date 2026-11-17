import * as Y from 'yjs'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {getPageAssetAttr} from './getPageAssetAttr'

export type CopyPageDocRewrite = {
  childCodes: ReadonlyMap<number, number>
  assetSrcs: ReadonlyMap<string, string>
  rootTitle?: string
}

export const copyPageDoc = (sourceState: Uint8Array, rewrite: CopyPageDocRewrite): Uint8Array => {
  const {childCodes, assetSrcs, rootTitle} = rewrite
  const doc = new Y.Doc()
  Y.applyUpdate(doc, sourceState)
  const fragment = doc.getXmlFragment('default')
  doc.transact(() => {
    const walker = fragment.createTreeWalker((yxml) => isPageLink(yxml) || !!getPageAssetAttr(yxml))
    for (const node of walker) {
      if (isPageLink(node)) {
        if (node.getAttribute('canonical') !== true) continue
        const copyCode = childCodes.get(Number(node.getAttribute('pageCode')))
        if (copyCode === undefined) node.setAttribute('canonical', false)
        else node.setAttribute('pageCode', copyCode)
        continue
      }
      const attr = getPageAssetAttr(node)
      if (!attr || !(node instanceof Y.XmlElement)) continue
      const src = node.getAttribute(attr)
      const copySrc = typeof src === 'string' ? assetSrcs.get(src) : undefined
      if (copySrc) node.setAttribute(attr, copySrc)
    }
    if (rootTitle !== undefined) {
      const rootHeading = fragment
        .toArray()
        .find((child) => child instanceof Y.XmlElement && child.nodeName === 'heading')
      if (rootHeading instanceof Y.XmlElement) {
        rootHeading.delete(0, rootHeading.length)
        rootHeading.insert(0, [new Y.XmlText(rootTitle)])
      }
    }
  })
  return Y.encodeStateAsUpdate(doc)
}
