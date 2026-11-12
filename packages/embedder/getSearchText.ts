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
    .replaceAll('\u0000', '')
    .replace(/\n{2,}/g, '\n')
    .trim()

const storedDocText = (content: string) => toSearchText(schema.nodeFromJSON(JSON.parse(content)))

const labeled = (label: string, content: string) => {
  const text = storedDocText(content)
  return text ? `${label}: ${text}` : ''
}

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
    return cells.some(Boolean) ? cells.join(' | ') : ''
  },
  embedBlock: ({node}) => node.attrs.title ?? '',
  imageBlock: ({node}) => node.attrs.alt ?? '',
  pageLinkBlock: ({node}) => node.attrs.title ?? '',
  responseBlock: ({node}) => labeled(node.attrs.preferredName, node.attrs.content),
  taskBlock: ({node}) => labeled('Task', node.attrs.content)
}

export const getSearchText = (block: JSONContent) => {
  try {
    return toSearchText(schema.nodeFromJSON({type: 'doc', content: [block]}))
  } catch {
    return ''
  }
}
