import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import resolveReactjis from '../resolvers/resolveReactjis'
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
  fields: {}
})

export default Reactable
