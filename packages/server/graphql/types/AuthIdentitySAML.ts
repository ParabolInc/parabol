import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AuthIdentity, {authStrategyFields} from './AuthIdentity'

const AuthIdentitySAML: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<any, GQLContext>(
  {
    name: 'AuthIdentitySAML',
    interfaces: () => [AuthIdentity],
    description: 'An authentication strategy using SAML',
    fields: () => ({
      ...authStrategyFields()
    })
  }
)

export default AuthIdentitySAML
