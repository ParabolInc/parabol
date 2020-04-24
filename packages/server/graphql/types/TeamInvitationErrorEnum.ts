import {GraphQLEnumType} from 'graphql'

const TeamInvitationErrorEnum = new GraphQLEnumType({
  name: 'TeamInvitationErrorEnum',
  description: 'The reason the invitation failed',
  values: {
    accepted: {},
    expired: {},
    notFound: {}
  }
})

export default TeamInvitationErrorEnum
