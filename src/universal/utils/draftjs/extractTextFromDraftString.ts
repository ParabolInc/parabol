import {RawDraftContentState} from 'draft-js'

const extractTextFromDraftString = (content: string) => {
  const parsedContent = JSON.parse(content) as RawDraftContentState
  const textBlocks = parsedContent.blocks.map(({text}) => text)
  return textBlocks.join('\n')
}

export default extractTextFromDraftString
