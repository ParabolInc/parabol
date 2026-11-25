import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'

interface GuardedPageLink {
  pageCode: unknown
  isCanonical: boolean
}

const collectGuardedPageLinks = (nodes: JSONContent[]): GuardedPageLink[] =>
  nodes.flatMap((node) => [
    ...(node.type === 'pageLinkBlock' && (node.attrs?.canonical || node.attrs?.synced)
      ? [{pageCode: node.attrs.pageCode, isCanonical: !!node.attrs.canonical}]
      : []),
    ...collectGuardedPageLinks(node.content ?? [])
  ])

export const assertNoAddedPageLinks = (existingNodes: JSONContent[], nextNodes: JSONContent[]) => {
  const existing = collectGuardedPageLinks(existingNodes)
  const added = collectGuardedPageLinks(nextNodes).filter(
    ({pageCode, isCanonical}) =>
      !existing.some((link) => link.pageCode === pageCode && link.isCanonical === isCanonical)
  )
  if (added.some(({isCanonical}) => isCanonical)) {
    throw new GraphQLError(
      "An access token limited to specific organizations, teams or pages can't make an existing page a sub-page. Use createPage to add one",
      {extensions: {code: 'FORBIDDEN'}}
    )
  }
  if (added.length > 0) {
    throw new GraphQLError(
      "An access token limited to specific organizations, teams or pages can't add a synced block that isn't already on this page",
      {extensions: {code: 'FORBIDDEN'}}
    )
  }
}
