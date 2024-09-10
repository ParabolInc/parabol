import resolveReactjis from '../../resolvers/resolveReactjis'
import {ReactableEnum, ReactableResolvers} from '../resolverTypes'

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
  reactjis: resolveReactjis
}

export default Reactable
