import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import AuthToken from '../../database/types/AuthToken'
import encodeAuthToken from '../../utils/encodeAuthToken'
import {GQLContext} from '../graphql'

// const AuthTokenRole = new GraphQLEnumType({
//   name: 'AuthTokenRole',
//   description: 'A role describing super user privileges',
//   values: {
//     // superuser
//     su: {}
//   }
// })

const AuthTokenPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AuthTokenPayload',
  description: 'An auth token provided by Parabol to the client',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The encoded JWT',
      resolve: ({tms}, _args: unknown, {authToken}) => {
        return encodeAuthToken(new AuthToken({...authToken, tms}))
      }
    }
    // aud: {
    //   type: new GraphQLNonNull(GraphQLID),
    //   description: 'audience. the target API. Parabol does not use this.'
    // },
    // bet: {
    //   type: new GraphQLNonNull(GraphQLInt),
    //   description: 'beta. 1 if enrolled in beta features. else absent'
    // },
    // exp: {
    //   type: new GraphQLNonNull(GraphQLFloat),
    //   description: 'expiration. Time since unix epoch / 1000'
    // },
    // iat: {
    //   type: new GraphQLNonNull(GraphQLFloat),
    //   description: 'issued at. Time since unix epoch / 1000'
    // },
    // iss: {
    //   type: new GraphQLNonNull(GraphQLString),
    //   description: 'issuer. the url that gave them the token. useful for detecting environment'
    // },
    // sub: {
    //   type: new GraphQLNonNull(GraphQLID),
    //   description: 'subscriber. userId'
    // },
    // rol: {
    //   type: AuthTokenRole,
    //   description: 'role. Any privileges associated with the account'
    // },
    // tms: {
    //   type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
    //   description: 'teams. a list of teamIds where the user is active'
    // }
  })
})

export default AuthTokenPayload
