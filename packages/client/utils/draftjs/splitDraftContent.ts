import {ContentState, convertFromRaw, RawDraftContentState} from 'draft-js'

const splitDraftContent = (content: string) => {
  const rawContent = JSON.parse(content) as RawDraftContentState
  const {blocks} = rawContent
  let {text: title} = blocks[0]
  // if the title exceeds 256, repeat it in the body because it probably has entities in it
  if (title.length <= 256) {
    blocks.shift()
  } else {
    title = title.slice(0, 256)
  }
  const contentState =
    blocks.length === 0 ? ContentState.createFromText('') : convertFromRaw(rawContent)
  return {title, contentState}
}

export default splitDraftContent
