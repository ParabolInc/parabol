import type {Editor} from '@tiptap/core'

const hasChildLinks = (editor: Editor, pageCodes: ReadonlySet<number>) => {
  let found = false
  editor.state.doc.descendants((node) => {
    if (found) return false
    if (
      node.type.name === 'pageLinkBlock' &&
      node.attrs.canonical === true &&
      pageCodes.has(node.attrs.pageCode)
    ) {
      found = true
    }
    return !found
  })
  return found
}

export const waitForChildLinksRemoved = (
  editor: Editor,
  pageCodes: readonly number[],
  timeoutMs: number
) =>
  new Promise<boolean>((resolve) => {
    const codes = new Set(pageCodes)
    if (!hasChildLinks(editor, codes)) {
      resolve(true)
      return
    }
    const finish = (removed: boolean) => {
      clearTimeout(timer)
      editor.off('transaction', onUpdate)
      resolve(removed)
    }
    const onUpdate = () => {
      if (!hasChildLinks(editor, codes)) finish(true)
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    editor.on('transaction', onUpdate)
  })
