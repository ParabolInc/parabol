import {markdownToTipTap} from 'parabol-client/shared/tiptap/markdownToTipTap'

const markdownToTaskContent = (markdown: string) => {
  const blocks = markdownToTipTap(markdown)
  const content = blocks.length
    ? blocks
    : [{type: 'paragraph', content: [{type: 'text', text: markdown}]}]
  return JSON.stringify({type: 'doc', content})
}

export default markdownToTaskContent
