import type {Editor} from '@tiptap/core'
import {isChildPageNode} from './getMovableBlocks'
import {waitUntil} from './waitUntil'

export const hasChildLinks = (editor: Editor, pageCodes: ReadonlySet<number>) => {
  let found = false
  editor.state.doc.descendants((node) => {
    if (!found && isChildPageNode(node)) found = pageCodes.has(node.attrs.pageCode)
    return !found
  })
  return found
}

export const waitForChildLinksRemoved = (
  editor: Editor,
  pageCodes: readonly number[],
  timeoutMs: number
) => {
  const codes = new Set(pageCodes)
  return waitUntil(
    () => !hasChildLinks(editor, codes),
    (onChange) => {
      editor.on('transaction', onChange)
      return () => editor.off('transaction', onChange)
    },
    timeoutMs
  )
}
