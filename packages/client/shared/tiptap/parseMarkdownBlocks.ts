import {getSchema, type JSONContent} from '@tiptap/core'
import {Fragment, type Node} from '@tiptap/pm/model'
import {linkDisallowedImages} from './linkDisallowedImages'
import {serverMarkdownManager} from './serverMarkdownManager'
import {serverTipTapExtensions} from './serverTipTapExtensions'

const schema = getSchema(serverTipTapExtensions)

const fillToSchema = (node: Node): Node => {
  if (node.isText) return node
  const children: Node[] = []
  node.forEach((child) => {
    children.push(fillToSchema(child))
  })
  return (
    node.type.createAndFill(node.attrs, children, node.marks) ?? node.copy(Fragment.from(children))
  )
}

export const parseMarkdownBlocks = (
  markdown: string,
  {isAllowedImageSrc}: {isAllowedImageSrc?: (src: string) => boolean} = {}
): JSONContent[] => {
  const parsed = serverMarkdownManager.parse(markdown).content ?? []
  const blocks = isAllowedImageSrc ? linkDisallowedImages(parsed, isAllowedImageSrc) : parsed
  return blocks.map((block) => fillToSchema(schema.nodeFromJSON(block)).toJSON())
}
