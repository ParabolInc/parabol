import {ContentBlock} from 'draft-js'

const blockStyleFn = (contentBlock: ContentBlock) => {
  const type = contentBlock.getType()
  if (type === 'blockquote') {
    return 'draft-blockquote'
  } else if (type === 'code-block') {
    return 'draft-codeblock'
  }
  return ''
}

export default blockStyleFn
