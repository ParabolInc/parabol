import {ContentState, convertToRaw} from 'draft-js'

const convertToRichText = (text) => {
  const contentState = ContentState.createFromText(text)
  const raw = convertToRaw(contentState)
  const {blocks} = raw
  // rewrite UIDs with incrementing int
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    block.key = i
  }
  return JSON.stringify(raw)
}

export default convertToRichText
