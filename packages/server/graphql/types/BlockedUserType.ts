import {GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const BlockedUserType = new GraphQLObjectType<any, GQLContext>({
  name: 'BlockedUserType',
  description: 'Identifier and IP address blocked',
  fields: () => ({
    identifier: {
      type: GraphQLString,
      description: 'The identifier (usually email) of blocked user'
    },
    id: {
      type: GraphQLString,
      description: 'The IP address of the blocked user'
    }
  })
})

export default BlockedUserType
