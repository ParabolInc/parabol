import {markdownToTipTap} from 'parabol-client/shared/tiptap/markdownToTipTap'
import {isParabolHostedAsset} from '../fileStorage/isParabolHostedAsset'

const markdownToTaskContent = (markdown: string) => {
  const blocks = markdownToTipTap(markdown, {isAllowedImageSrc: isParabolHostedAsset})
  const content = blocks.length
    ? blocks
    : [{type: 'paragraph', content: [{type: 'text', text: markdown}]}]
  return JSON.stringify({type: 'doc', content})
}

export default markdownToTaskContent
