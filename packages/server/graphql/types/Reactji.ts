import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType
} from 'graphql'
import {GQLContext} from '../graphql'

export type ReactjiType = {
  id: string
  userIds: string[]
  count: number
  isViewerReactji: boolean
}

const Reactji = new GraphQLObjectType<ReactjiType, GQLContext>({
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
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(require('./User').default))),
      description: 'The users who added a reactji',
      resolve: (parent, _args: any, {dataLoader}) => {
        return dataLoader.get('users').loadMany(parent.userIds)
      }
    },
    isViewerReactji: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is included in the count, else false'
    }
  })
})

export default Reactji
