import {Editor, type JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from './serverTipTapExtensions'

export const tipTapToMarkdown = (content: JSONContent) => {
  const editor = new Editor({
    element: undefined,
    content,
    extensions: serverTipTapExtensions
  })
  const markdown = editor.getMarkdown()
  editor.destroy()
  return markdown
}
