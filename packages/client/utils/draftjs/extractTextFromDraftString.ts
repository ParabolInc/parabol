import {RawDraftContentState} from 'draft-js'

const extractTextFromDraftString = (content: string) => {
  const parsedContent = JSON.parse(content) as RawDraftContentState
  // toWellFormed replaces lone surrogates with replacement char (e.g. emoji that only has its first code point)
  const textBlocks = parsedContent.blocks.map(({text}) => (text as any).toWellFormed())
  return textBlocks.join('\n')
}

export default extractTextFromDraftString
