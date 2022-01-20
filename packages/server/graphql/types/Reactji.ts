import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import ReactjiDB from '../../database/types/Reactji'
import {GQLContext} from '../graphql'

export type ReactjiType = {
  id: string
  count: number
  isViewerReactji: boolean
}

const Reactji = new GraphQLObjectType<ReactjiDB, GQLContext>({
  name: 'Reactji',
  description: 'An aggregate of reactji metadata',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite of entity:reactjiId'
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of users who have added this reactji'
    },
    isViewerReactji: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is included in the count, else false'
    }
  })
})

export default Reactji
