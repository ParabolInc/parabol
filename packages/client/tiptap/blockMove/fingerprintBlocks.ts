import type {JSONContent} from '@tiptap/core'

const withoutIgnoredLinks = (
  nodes: JSONContent[],
  ignoredPageCodes: ReadonlySet<number>
): JSONContent[] =>
  nodes
    .filter(
      (node) =>
        !(node.type === 'pageLinkBlock' && ignoredPageCodes.has(Number(node.attrs?.pageCode)))
    )
    .map((node) =>
      node.content ? {...node, content: withoutIgnoredLinks(node.content, ignoredPageCodes)} : node
    )

export const fingerprintBlocks = (blocks: JSONContent[], ignoredPageCodes: ReadonlySet<number>) =>
  JSON.stringify(withoutIgnoredLinks(blocks, ignoredPageCodes))
