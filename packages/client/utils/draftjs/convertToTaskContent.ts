import {ContentState, convertToRaw} from 'draft-js'
import entitizeText from './entitizeText'

export const removeSpaces = (str: string) =>
  str
    .split(/\s/)
    .filter((s) => s.length)
    .join(' ')

export function convertStateToRaw(contentState: ContentState) {
  const selectionState = contentState.getSelectionAfter().merge({
    anchorKey: contentState.getFirstBlock().getKey(),
    focusKey: contentState.getLastBlock().getKey(),
    anchorOffset: 0,
    focusOffset: contentState.getLastBlock().getLength()
  })

  const nextContentState = entitizeText(contentState, selectionState) || contentState
  const raw = convertToRaw(nextContentState)
  return JSON.stringify(raw)
}

const convertToTaskContent = (spacedText: string) => {
  const text = removeSpaces(spacedText)
  const contentState = ContentState.createFromText(text)
  return convertStateToRaw(contentState)
}

export default convertToTaskContent
