import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'standups' | 'azureDevOps' | 'msTeams' | 'gitlab'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    standups: {},
    azureDevOps: {},
    msTeams: {},
    gitlab: {}
  }
})

export default UserFlagEnum
