import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import ReactjiDB from '../../database/types/Reactji'
import {GQLContext} from '../graphql'

const Reactji = new GraphQLObjectType<ReactjiDB, GQLContext>({
  name: 'Reactji',
  description: 'An aggregate of reactji metadata',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'composite of entity:reactjiId'
    },
    count: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The number of users who have added this reactji'
    },
    isViewerReactji: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is included in the count, else false'
    }
  })
})

export default Reactji
