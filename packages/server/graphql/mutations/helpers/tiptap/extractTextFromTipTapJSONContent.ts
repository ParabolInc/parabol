import {JSONContent} from '@tiptap/core'

const extractTextFromTipTapJSONContent = (input: JSONContent): string => {
  if (input.text) {
    return input.text
  } else if (input.content) {
    const content = input.content
    const newLine = input.type === 'paragraph' ? '\n' : ''
    return (
      content.map((subContent) => extractTextFromTipTapJSONContent(subContent)).join('') + newLine
    )
  } else {
    return input.type === 'paragraph' ? '\n' : ''
  }
}

export default extractTextFromTipTapJSONContent
