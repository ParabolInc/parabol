// This returns a Content array of blocks, not a whole JSONContent.
import {parseMarkdownBlocks} from './parseMarkdownBlocks'
import type {TipTapSerializedContent} from './TipTapSerializedContent'

export const markdownToTipTap = (
  str: string,
  {isAllowedImageSrc = () => false}: {isAllowedImageSrc?: (src: string) => boolean} = {}
): TipTapSerializedContent['content'] => {
  try {
    return parseMarkdownBlocks(str, {isAllowedImageSrc}) as TipTapSerializedContent['content']
  } catch (e) {
    console.error(e)
    return []
  }
}
