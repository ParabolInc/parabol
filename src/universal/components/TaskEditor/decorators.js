import EditorLink from './EditorLink'
import {CompositeDecorator} from 'draft-js'
import Hashtag from 'universal/components/TaskEditor/Hashtag'
import Mention from 'universal/components/TaskEditor/Mention'
import TruncatedEllipsis from 'universal/components/TaskEditor/TruncatedEllipsis'

const findEntity = (entityType) => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return entityKey !== null && contentState.getEntity(entityKey).getType() === entityType
  }, callback)
}

const decorators = (getEditorState, setEditorState) =>
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
