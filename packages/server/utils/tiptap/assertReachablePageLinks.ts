import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'

type PageLinkKind = 'canonical' | 'synced' | 'plain'

interface PageLink {
  pageCode: unknown
  kind: PageLinkKind
}

const getPageLinkKind = (attrs: JSONContent['attrs']): PageLinkKind =>
  attrs?.canonical ? 'canonical' : attrs?.synced ? 'synced' : 'plain'

const collectPageLinks = (nodes: JSONContent[]): PageLink[] =>
  nodes.flatMap((node) => [
    ...(node.type === 'pageLinkBlock'
      ? [{pageCode: node.attrs?.pageCode, kind: getPageLinkKind(node.attrs)}]
      : []),
    ...collectPageLinks(node.content ?? [])
  ])

export const collectLinkedPageCodes = (nodes: JSONContent[]) =>
  collectPageLinks(nodes).map(({pageCode}) => pageCode)

export const assertReachablePageLinks = (
  existingNodes: JSONContent[],
  nextNodes: JSONContent[],
  reachablePageCodes: number[]
) => {
  const existing = collectPageLinks(existingNodes)
  const reachable = new Set<unknown>(reachablePageCodes)
  const added = collectPageLinks(nextNodes).filter(
    ({pageCode, kind}) => !existing.some((link) => link.pageCode === pageCode && link.kind === kind)
  )
  if (added.some(({kind}) => kind === 'canonical')) {
    throw new GraphQLError(
      "An access token limited to specific organizations, teams or pages can't make an existing page a sub-page. Use createPage to add one",
      {extensions: {code: 'FORBIDDEN'}}
    )
  }
  if (added.some(({pageCode}) => !reachable.has(pageCode))) {
    throw new GraphQLError(
      'An access token limited to specific organizations, teams or pages can only link to pages it can reach',
      {extensions: {code: 'FORBIDDEN'}}
    )
  }
}
