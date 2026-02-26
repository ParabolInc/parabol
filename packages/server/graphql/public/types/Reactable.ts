import {getUserId} from '../../../utils/authorization'
import getGroupedReactjis from '../../../utils/getGroupedReactjis'
import type {ReactableEnum, ReactableResolvers} from '../resolverTypes'

export const getReactableType = (reactable: any): ReactableEnum => {
  if (reactable.reflectionGroupId) {
    return 'REFLECTION'
  } else if (reactable.discussionId) {
    return 'COMMENT'
  } else {
    return 'RESPONSE'
  }
}

const Reactable: ReactableResolvers = {
  __resolveType: (type) => {
    const reactableType = getReactableType(type)
    const lookup = {
      COMMENT: 'Comment',
      REFLECTION: 'RetroReflection',
      RESPONSE: 'TeamPromptResponse'
    } as const
    return lookup[reactableType]
  },
  reactjis: ({reactjis, id}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return getGroupedReactjis(reactjis, viewerId, id)
  }
}

export default Reactable
