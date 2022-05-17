import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'standups' | 'azureDevOps'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    standups: {},
    azureDevOps: {}
  }
})

export default UserFlagEnum
