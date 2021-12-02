import EditorLink from './EditorLink'
import {CompositeDecorator, ContentBlock, ContentState, EditorState} from 'draft-js'
import Hashtag from './Hashtag'
import Mention from './Mention'
import TruncatedEllipsis from './TruncatedEllipsis'
import {SetEditorState} from '../../types/draft'

const findEntity = (entityType: string) => (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return entityKey !== null && contentState.getEntity(entityKey).getType() === entityType
  }, callback)
}

const decorators = (
  getEditorState: () => EditorState | undefined,
  setEditorState?: SetEditorState
) =>
  new CompositeDecorator([
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
  ])

export default decorators
