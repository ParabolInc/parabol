import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import authCount from '../../private/queries/helpers/authCount'
import authCountByDomain from '../../private/queries/helpers/authCountByDomain'
import DomainCountPayload from './DomainCountPayload'

const SignupsPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SignupsPayload',
  fields: () => ({
    total: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the total number of signups for the given time range',
      resolve: async ({after, isActive}) => {
        return authCount(after, isActive, 'createdAt')
      }
    },
    byDomain: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DomainCountPayload))),
      description: 'The total broken down by email domain',
      resolve: async ({after, isActive}) => {
        return authCountByDomain(after, isActive, 'createdAt')
      }
    }
  })
})

export default SignupsPayload
