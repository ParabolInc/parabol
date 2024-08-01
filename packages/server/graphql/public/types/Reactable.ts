import resolveReactjis from '../../resolvers/resolveReactjis'
import getReactableType from '../../types/getReactableType'
import {ReactableResolvers} from '../resolverTypes'

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
