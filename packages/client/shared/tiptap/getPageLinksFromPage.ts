import {JSONContent} from '@tiptap/core'
import type {PageLinkBlockAttributes} from './extensions/PageLinkBlockBase'
import {getAllNodesAttributesByType} from './getAllNodesAttributesByType'

export const getPageLinksFromPage = (content: JSONContent) => {
  const nodes = getAllNodesAttributesByType<PageLinkBlockAttributes>(content, 'pageLinkBlock')
  // :auto is for auto links. Necessary so we can diff via LCS and add/remove/update sortOrder
  return nodes.map(({pageCode, auto}) => (auto ? `${pageCode}:auto` : `${pageCode}`))
}
