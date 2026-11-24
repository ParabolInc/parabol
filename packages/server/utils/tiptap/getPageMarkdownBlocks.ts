import type {JSONContent} from '@tiptap/core'
import {serverMarkdownManager} from '../../../client/shared/tiptap/serverMarkdownManager'
import {Logger} from '../Logger'

export const PAGE_BLOCK_SEPARATOR = '\n\n'

const serializeBlock = (node: JSONContent): string => {
  try {
    return serverMarkdownManager.serialize({type: 'doc', content: [node]})
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    Logger.warn(`A ${node.type} block could not be written as markdown: ${reason}`)
    return ''
  }
}

export const getPageMarkdownBlocks = (nodes: JSONContent[]) =>
  nodes.map((node) => serializeBlock(node).replace(/^\n+|\n+$/g, ''))
