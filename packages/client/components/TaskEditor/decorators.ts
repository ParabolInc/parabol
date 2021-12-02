import {CompositeDecorator, EditorState, ContentBlock} from 'draft-js'
import EditorLink from './EditorLink'
import Hashtag from './Hashtag'
import Mention from './Mention'
import SearchHighlight from './SearchHighlight'
import TruncatedEllipsis from './TruncatedEllipsis'
import {SetEditorState} from '../../types/draft'

const findEntity = (entityType) => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return entityKey !== null && contentState.getEntity(entityKey).getType() === entityType
  }, callback)
}

const decorators = (
  getEditorState: () => EditorState | undefined,
  setEditorState?: SetEditorState,
  searchQuery?: string | null
) => {
  const compositeDecorator = [
    {
      strategy: findEntity('LINK'),
      component: EditorLink(getEditorState)
    },
    {
      strategy: findEntity('TAG'),
      component: Hashtag
    },
    {
      strategy: findEntity('MENTION'),
      component: Mention
    },
    {
      strategy: findEntity('TRUNCATED_ELLIPSIS'),
      component: TruncatedEllipsis(setEditorState)
    }
  ]

  if (searchQuery) {
    const findMatchingText = (
      contentBlock: ContentBlock,
      callback: (startIdx: number, endIdx: number) => void
    ) => {
      if (!searchQuery) {
        return
      }
      const textLower = contentBlock.getText().toLowerCase()
      const searchQueryLower = searchQuery.toLowerCase()

      let start = 0
      let foundAll = true
      while (foundAll) {
        const index = textLower.indexOf(searchQueryLower, start)
        if (index === -1) {
          foundAll = false
        } else {
          start = index + 1
          callback(index, index + searchQueryLower.length)
        }
      }
    }

    compositeDecorator.push({
      strategy: findMatchingText,
      component: SearchHighlight
    })
  }

  return new CompositeDecorator(compositeDecorator)
}

export default decorators
