import {JSONContent} from '@tiptap/core'
import type {PageLinkBlockAttributes} from './extensions/PageLinkBlockBase'
import {getAllNodesAttributesByType} from './getAllNodesAttributesByType'

export const getPageLinksFromPage = (content: JSONContent) => {
  const nodes = getAllNodesAttributesByType<PageLinkBlockAttributes>(content, 'pageLinkBlock')
  return new Set(nodes.map(({pageId}) => pageId))
}
