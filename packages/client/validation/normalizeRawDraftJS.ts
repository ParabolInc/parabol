import {RawDraftContentState} from 'draft-js'
import makeEmptyStr from '../utils/draftjs/makeEmptyStr'

const normalizeRawDraftJS = (str: string | undefined | null) => {
  if (!str) return makeEmptyStr()
  let parsedContent: RawDraftContentState
  try {
    parsedContent = JSON.parse(str)
  } catch (e) {
    return makeEmptyStr()
  }
  const keys = Object.keys(parsedContent)
  if (
    keys.length !== 2 ||
    typeof parsedContent.entityMap !== 'object' ||
    !Array.isArray(parsedContent.blocks) ||
    parsedContent.blocks.length === 0
  ) {
    return makeEmptyStr()
  }
  // remove empty first block
  const {blocks} = parsedContent
  const firstBlockIdx = blocks.findIndex((block) => Boolean(block.text.replace(/\s/g, '')))
  if (firstBlockIdx === -1) {
    return makeEmptyStr()
  }
  if (firstBlockIdx > 0) {
    return JSON.stringify({
      ...parsedContent,
      blocks: blocks.slice(firstBlockIdx)
    })
  }
  return str
}

export default normalizeRawDraftJS
