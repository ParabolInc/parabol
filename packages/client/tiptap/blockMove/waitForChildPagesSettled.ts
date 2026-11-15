import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import {holdsChildPageLink} from './blockSnapshot'
import {hasChildLinks} from './waitForChildLinksRemoved'

export const waitForChildPagesSettled = (
  editor: Editor,
  targetFrag: Y.XmlFragment,
  pageCodes: readonly number[],
  timeoutMs: number
) =>
  new Promise<Set<number>>((resolve) => {
    const stillOnTarget = () =>
      new Set(pageCodes.filter((code) => holdsChildPageLink(targetFrag, new Set([code]))))
    const isSettled = () =>
      editor.isDestroyed ||
      [...stillOnTarget()].every((code) => !hasChildLinks(editor, new Set([code])))
    if (isSettled()) {
      resolve(stillOnTarget())
      return
    }
    const finish = () => {
      clearTimeout(timer)
      targetFrag.unobserveDeep(onChange)
      editor.off('transaction', onChange)
      resolve(stillOnTarget())
    }
    const onChange = () => {
      if (isSettled()) finish()
    }
    const timer = setTimeout(finish, timeoutMs)
    targetFrag.observeDeep(onChange)
    editor.on('transaction', onChange)
  })
