import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AuthIdentity, {authStrategyFields} from './AuthIdentity'

const AuthIdentityLocal = new GraphQLObjectType<any, GQLContext, any>({
  name: 'AuthIdentityLocal',
  interfaces: () => [AuthIdentity],
  description: 'An authentication strategy using an email & password',
  fields: () => ({
    ...authStrategyFields()
  })
})

export default AuthIdentityLocal
