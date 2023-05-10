import {GraphQLEnumType} from 'graphql'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    azureDevOps: {},
    msTeams: {},
    templateLimit: {},
    noAISummary: {},
    noMeetingHistoryLimit: {},
    gcal: {},
    checkoutFlow: {}
  }
})

export default UserFlagEnum
