import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import resolveReactjis from '../resolvers/resolveReactjis'
import Reactji from './Reactji'
import getReactableType from './getReactableType'

export const reactableFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  reactjis: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Reactji))),
    description: 'All the reactjis for the given reflection',
    resolve: resolveReactjis
  }
})

const Reactable = new GraphQLInterfaceType({
  name: 'Reactable',
  description: 'An item that can have reactjis',
  fields: reactableFields,
  resolveType: (type) => {
    const reactableType = getReactableType(type)
    const lookup = {
      COMMENT: 'Comment',
      REFLECTION: 'RetroReflection',
      RESPONSE: 'TeamPromptResponse'
    } as const
    return lookup[reactableType]
  }
})

export default Reactable
