import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import authCount from '../../private/queries/helpers/authCount'
import authCountByDomain from '../../private/queries/helpers/authCountByDomain'
import DomainCountPayload from './DomainCountPayload'

const LoginsPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'LoginsPayload',
  fields: () => ({
    total: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the total number of records',
      resolve: async ({after, isActive}) => {
        return authCount(after, isActive, 'lastSeenAt')
      }
    },
    byDomain: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DomainCountPayload))),
      description: 'The total broken down by email domain',
      resolve: async ({after, isActive}) => {
        return authCountByDomain(after, isActive, 'lastSeenAt')
      }
    }
  })
})

export default LoginsPayload
