import {ReactableEnum} from '../../database/types/Reactable'

const getReactableType = (reactable: any): ReactableEnum => {
  if (reactable.reflectionGroupId) {
    return 'REFLECTION'
  } else if (reactable.discussionId) {
    return 'COMMENT'
  } else {
    return 'RESPONSE'
  }
}

export default getReactableType
