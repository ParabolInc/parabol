import * as Y from 'yjs'
import {PAGE_ASSET_ATTRS} from './pageAssetAttrs'

export const getPageAssetAttr = (node: unknown) =>
  node instanceof Y.XmlElement ? PAGE_ASSET_ATTRS.get(node.nodeName) : undefined
