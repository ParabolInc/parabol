// This returns a Content array of blocks, not a whole JSONContent.
import {Editor} from '@tiptap/core'
import {linkDisallowedImages} from './linkDisallowedImages'
import {serverTipTapExtensions} from './serverTipTapExtensions'
import type {TipTapSerializedContent} from './TipTapSerializedContent'

export const markdownToTipTap = (
  str: string,
  {isAllowedImageSrc = () => false}: {isAllowedImageSrc?: (src: string) => boolean} = {}
): TipTapSerializedContent['content'] => {
  try {
    const editor = new Editor({
      element: undefined,
      content: str,
      contentType: 'markdown',
      extensions: serverTipTapExtensions
    })
    return linkDisallowedImages(
      editor.getJSON().content ?? [],
      isAllowedImageSrc
    ) as TipTapSerializedContent['content']
  } catch (e) {
    console.error(e)
    return []
  }
}
