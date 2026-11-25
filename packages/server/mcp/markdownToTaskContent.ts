import {getSchema, type JSONContent} from '@tiptap/core'
import {markdownToTipTap} from 'parabol-client/shared/tiptap/markdownToTipTap'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {isParabolHostedAsset} from '../fileStorage/isParabolHostedAsset'

const EVERY_EDITOR_NODES = [
  'paragraph',
  'text',
  'hardBreak',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'horizontalRule',
  'mention',
  'emojiMention',
  'loom'
]

const RENDERABLE_NODES = {
  task: new Set([
    ...EVERY_EDITOR_NODES,
    'taskTag',
    'taskList',
    'taskItem',
    'imageBlock',
    'fileBlock'
  ]),
  reflection: new Set([...EVERY_EDITOR_NODES, 'taskList', 'taskItem', 'imageBlock']),
  comment: new Set([...EVERY_EDITOR_NODES, 'taskTag', 'popoverMention']),
  standup: new Set([
    ...EVERY_EDITOR_NODES,
    'taskList',
    'taskItem',
    'imageBlock',
    'fileBlock',
    'details',
    'detailsSummary',
    'detailsContent',
    'table',
    'tableRow',
    'tableHeader',
    'tableCell'
  ])
}

export type EditorSurface = keyof typeof RENDERABLE_NODES

const schema = getSchema(serverTipTapExtensions)

const joinInline = (groups: JSONContent[][], separator: string) =>
  groups
    .filter((group) => group.length > 0)
    .flatMap((group, idx) => (idx === 0 ? group : [{type: 'text', text: separator}, ...group]))

const getInlineContent = (node: JSONContent): JSONContent[] => {
  const nodeType = node.type ? schema.nodes[node.type] : undefined
  if (nodeType?.isInline) return [node]
  if (nodeType?.isTextblock) return node.content ?? []
  return joinInline((node.content ?? []).map(getInlineContent), ' ')
}

const getParagraphContent = (node: JSONContent) => {
  if (node.type === 'tableRow') {
    return joinInline((node.content ?? []).map(getInlineContent), ' | ')
  }
  if (node.type && schema.nodes[node.type]?.isTextblock) return node.content ?? []
  return null
}

const keepRenderable = (nodes: JSONContent[], renderable: Set<string>): JSONContent[] =>
  nodes.flatMap((node) => {
    if (!node.type) return []
    if (renderable.has(node.type)) {
      if (!node.content) return [node]
      const content = keepRenderable(node.content, renderable)
      return content.length === 0 && node.content.length > 0 ? [] : [{...node, content}]
    }
    const paragraphContent = getParagraphContent(node)
    if (!paragraphContent) return keepRenderable(node.content ?? [], renderable)
    const content = keepRenderable(paragraphContent, renderable)
    return content.length > 0 ? [{type: 'paragraph', content}] : []
  })

const markdownToTaskContent = (markdown: string, surface: EditorSurface) => {
  const renderable = RENDERABLE_NODES[surface]
  const parsed = markdownToTipTap(markdown, {
    isAllowedImageSrc: (src) => renderable.has('imageBlock') && isParabolHostedAsset(src)
  })
  const blocks = keepRenderable(parsed, renderable)
  const content = blocks.length
    ? blocks
    : [{type: 'paragraph', content: [{type: 'text', text: markdown}]}]
  return JSON.stringify({type: 'doc', content})
}

export default markdownToTaskContent
