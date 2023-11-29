import {GraphQLEnumType} from 'graphql'

const AuthIdentityTypeEnum = new GraphQLEnumType({
  name: 'AuthIdentityTypeEnum',
  description: 'The types of authentication strategies',
  values: {
    LOCAL: {},
    GOOGLE: {},
    MICROSOFT: {}
  }
})

export default AuthIdentityTypeEnum
