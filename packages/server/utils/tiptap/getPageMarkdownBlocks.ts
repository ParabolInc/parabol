import type {Editor, JSONContent} from '@tiptap/core'
import {Logger} from '../Logger'

export const PAGE_BLOCK_SEPARATOR = '\n\n'

const serializeBlock = (editor: Editor, node: JSONContent): string => {
  try {
    return editor.storage.markdown.manager.serialize({type: 'doc', content: [node]})
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    Logger.warn(`A ${node.type} block could not be written as markdown: ${reason}`)
    return ''
  }
}

export const getPageMarkdownBlocks = (editor: Editor, nodes: JSONContent[]) =>
  nodes.map((node) => serializeBlock(editor, node).replace(/^\n+|\n+$/g, ''))
