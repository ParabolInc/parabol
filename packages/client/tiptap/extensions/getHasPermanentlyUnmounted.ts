import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'

// This is necessary because TipTap will mount/unmount nodes all the time, even when their props don't change
// So if we e.g. call editor.setEditable(false) inside of a node's useEffect, it will call flushSync
// while react is already flushing, which causes an error
export const getHasPermanentlyUnmounted = (editor: Editor, node: Node) => {
  let hasBlock = false
  editor.state.doc.descendants((currentNode) => {
    if (currentNode.eq(node)) {
      hasBlock = true
    }
    return false
  })
  return !hasBlock
}
