import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AuthIdentity, {authStrategyFields} from './AuthIdentity'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const AuthIdentityLocal = new GraphQLObjectType<any, GQLContext, any>({
  name: 'AuthIdentityLocal',
  interfaces: () => [AuthIdentity],
  description: 'An authentication strategy using an email & password',
  fields: () => ({
    ...authStrategyFields(),
    verifiedEmailToken: {
      type: GraphQLID,
      description: `The token used to verify the user's email address. If null, verification is not pending`
    },
    verifiedEmailTokenExpiration: {
      type: GraphQLISO8601Type,
      description: `The token expiration. If null, verification not pending`
    },
    resetPasswordToken: {
      type: GraphQLID,
      description: `The token used to reset the local strategy's password. If null, no reset is pending`
    },
    resetPasswordTokenExpiration: {
      type: GraphQLISO8601Type,
      description: `The token expiration. If null, verification is complete`
    }
  })
})

export default AuthIdentityLocal
