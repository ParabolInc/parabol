import {GraphQLEnumType} from 'graphql'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    azureDevOps: {},
    msTeams: {},
    noAISummary: {},
    noMeetingHistoryLimit: {},
    checkoutFlow: {},
    canViewTeamsInDomain: {}, // careful with this flag. They will see all teams in their domain
    gcal: {}
  }
})

export default UserFlagEnum
