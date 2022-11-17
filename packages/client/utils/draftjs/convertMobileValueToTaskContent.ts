import {ContentState} from 'draft-js'
import {convertStateToRaw} from './convertToTaskContent'

const convertAndroidValueToTaskContent = (spacedText: string) => {
  const text = spacedText.trim()
  const contentState = ContentState.createFromText(text)
  return convertStateToRaw(contentState)
}

export default convertAndroidValueToTaskContent
