import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'azureDevOps' | 'msTeams'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    azureDevOps: {},
    msTeams: {},
    templateLimit: {},
    aiSummary: {},
    meetingHistoryLimit: {}
  }
})

export default UserFlagEnum
