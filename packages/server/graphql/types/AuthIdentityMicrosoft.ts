import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AuthIdentity, {authStrategyFields} from './AuthIdentity'

const AuthIdentityMicrosoft = new GraphQLObjectType<any, GQLContext>({
  name: 'AuthIdentityMicrosoft',
  interfaces: () => [AuthIdentity],
  description: 'An authentication strategy using Microsoft',
  fields: () => ({
    ...authStrategyFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Microsoft ID for this strategy'
    }
  })
})

export default AuthIdentityMicrosoft
