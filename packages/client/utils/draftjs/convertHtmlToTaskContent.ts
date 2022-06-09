import {ContentState, convertFromHTML} from 'draft-js'
import {convertStateToRaw, removeSpaces} from './convertToTaskContent'
import simpleDOMBuilder from './simpleDOMBuilder'

export const convertHtmlToTaskContent = (spacedHtml: string) => {
  const markup = removeSpaces(spacedHtml)
  // ref: [convertFromHTML document is not defined on server side rendering · Issue #1361 · facebook/draft-js](https://github.com/facebook/draft-js/issues/1361)
  const DOMBuilder = typeof document === 'undefined' ? simpleDOMBuilder : undefined
  const blocksFromHTML = convertFromHTML(markup, DOMBuilder)

  const contentState = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  )
  return convertStateToRaw(contentState)
}
