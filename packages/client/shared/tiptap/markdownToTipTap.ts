// This returns a Content array of blocks, not a whole JSONContent.
import {Editor} from '@tiptap/core'
import {serverTipTapExtensions} from './serverTipTapExtensions'
import type {TipTapSerializedContent} from './TipTapSerializedContent'

export const markdownToTipTap = (str: string): TipTapSerializedContent['content'] => {
  try {
    const editor = new Editor({
      element: undefined,
      content: str,
      contentType: 'markdown',
      extensions: serverTipTapExtensions
    })
    return editor.getJSON().content as TipTapSerializedContent['content']
  } catch (e) {
    console.error(e)
    return []
  }
}
