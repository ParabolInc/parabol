import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import Reactji from './Reactji'
import resolveReactjis from '../resolvers/resolveReactjis'
import getReactableType from './getReactableType'
import {ReactableEnum} from 'parabol-client/types/graphql'

export const reactableFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  reactjis: {
    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Reactji))),
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
      [ReactableEnum.COMMENT]: require('./Comment').default,
      [ReactableEnum.REFLECTION]: require('./RetroReflection').default
    }
    return lookup[reactableType]
  }
})

export default Reactable
