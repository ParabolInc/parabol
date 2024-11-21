import {JSONContent} from '@tiptap/core'
import fnTranslate from 'md-to-adf'
import {convertTipTapToMarkdown} from './convertTipTapToMarkdown'
export const convertTipTapToADF = (content: JSONContent) => {
  const markdown = convertTipTapToMarkdown(content)
  const adf = fnTranslate(markdown)
  return adf
}
