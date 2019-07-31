import {CompositeDecorator} from 'draft-js'
import EllipsisDecorator from './Ellipsis'

const findEntity = (entityType) => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return entityKey !== null && contentState.getEntity(entityKey).getType() === entityType
  }, callback)
}

const anonymousReflectionDecorators = new CompositeDecorator([
  {
    strategy: findEntity('ELLIPSIS'),
    component: EllipsisDecorator
  }
])

export default anonymousReflectionDecorators
