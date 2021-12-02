import EditorLink from './EditorLink'
import {CompositeDecorator, EditorState} from 'draft-js'
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

const findText = (searchQuery) => (contentBlock, callback) => {
  if (!searchQuery) {
    return
  }
  const textLower = contentBlock.getText().toLowerCase()
  const searchQueryLower = searchQuery.toLowerCase()

  let start = 0
  let found = true
  while (found) {
    const index = textLower.indexOf(searchQueryLower, start)
    if (index === -1) {
      found = false
    } else {
      start = index + 1
      callback(index, index + searchQueryLower.length)
    }
  }
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
    compositeDecorator.push({
      strategy: findText(searchQuery),
      component: SearchHighlight
    })
  }

  return new CompositeDecorator(compositeDecorator)
}

export default decorators
