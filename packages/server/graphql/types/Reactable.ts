import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import resolveReactjis from '../resolvers/resolveReactjis'
import getReactableType from './getReactableType'
import Reactji from './Reactji'

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
      COMMENT: require('./Comment').default,
      REFLECTION: require('./RetroReflection').default,
      RESPONSE: require('./TeamPromptResponse').default
    } as const
    return lookup[reactableType]
  }
})

export default Reactable
