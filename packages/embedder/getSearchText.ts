import {
  getSchema,
  getText,
  getTextBetween,
  getTextSerializersFromSchema,
  type JSONContent,
  type TextSerializer
} from '@tiptap/core'
import type {Node as ProseMirrorNode} from '@tiptap/pm/model'
import {serverTipTapExtensions} from '../client/shared/tiptap/serverTipTapExtensions'

const schema = getSchema(serverTipTapExtensions)

const toSearchText = (node: ProseMirrorNode): string =>
  getText(node, {blockSeparator: '\n', textSerializers})
    .replace(/\n{2,}/g, '\n')
    .trim()

const storedDocText = (content: string) => toSearchText(schema.nodeFromJSON(JSON.parse(content)))

const cellText = (cell: ProseMirrorNode) =>
  getTextBetween(cell, {from: 0, to: cell.content.size}, {blockSeparator: ' ', textSerializers})
    .replace(/\s+/g, ' ')
    .trim()

const textSerializers: Record<string, TextSerializer> = {
  ...getTextSerializersFromSchema(schema),
  tableRow: ({node}) => {
    const cells: string[] = []
    node.forEach((cell) => {
      cells.push(cellText(cell))
    })
    return cells.join(' | ')
  },
  embedBlock: ({node}) => node.attrs.title ?? '',
  imageBlock: ({node}) => node.attrs.alt ?? '',
  responseBlock: ({node}) => `${node.attrs.preferredName}: ${storedDocText(node.attrs.content)}`,
  taskBlock: ({node}) => `Task: ${storedDocText(node.attrs.content)}`
}

export const getSearchText = (block: JSONContent) => {
  try {
    return toSearchText(schema.nodeFromJSON({type: 'doc', content: [block]}))
  } catch {
    return ''
  }
}
