import {GraphQLEnumType} from 'graphql'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    azureDevOps: {},
    noAISummary: {},
    noMeetingHistoryLimit: {},
    adHocTeams: {},
    noTemplateLimit: {},
    signUpDestinationTeam: {}
  }
})

export default UserFlagEnum
