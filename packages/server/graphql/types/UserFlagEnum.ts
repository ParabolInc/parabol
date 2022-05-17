import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'standups' | 'azureDevOps' | 'msTeams'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    standups: {},
    azureDevOps: {},
    msTeams: {}
  }
})

export default UserFlagEnum
