import {generateText, type JSONContent} from '@tiptap/core'
import type {Node as ProseMirrorNode} from '@tiptap/pm/model'
import {serverTipTapExtensions} from '../client/shared/tiptap/serverTipTapExtensions'

const cellText = (cell: ProseMirrorNode) => cell.textBetween(0, cell.content.size, ' ').trim()

export const getSearchText = (node: JSONContent) => {
  try {
    return generateText({type: 'doc', content: [node]}, serverTipTapExtensions, {
      blockSeparator: '\n',
      textSerializers: {
        tableRow: ({node: row}) => {
          const cells: string[] = []
          row.forEach((cell) => {
            cells.push(cellText(cell))
          })
          return cells.join(' | ')
        },
        embedBlock: ({node: embed}) => embed.attrs.title ?? ''
      }
    })
      .replace(/\n{2,}/g, '\n')
      .trim()
  } catch {
    return ''
  }
}
