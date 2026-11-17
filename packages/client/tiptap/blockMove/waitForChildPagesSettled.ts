import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import {childPageCodesIn} from './blockSnapshot'
import {hasChildLinks} from './waitForChildLinksRemoved'
import {waitUntil} from './waitUntil'

export const waitForChildPagesSettled = async (
  editor: Editor,
  targetFrag: Y.XmlFragment,
  pageCodes: readonly number[],
  timeoutMs: number
) => {
  const stillOnTarget = () => {
    const onTarget = childPageCodesIn(targetFrag)
    return new Set(pageCodes.filter((code) => onTarget.includes(code)))
  }
  await waitUntil(
    () => editor.isDestroyed || !hasChildLinks(editor, stillOnTarget()),
    (onChange) => {
      editor.on('transaction', onChange)
      targetFrag.observeDeep(onChange)
      return () => {
        editor.off('transaction', onChange)
        targetFrag.unobserveDeep(onChange)
      }
    },
    timeoutMs
  )
  return stillOnTarget()
}
