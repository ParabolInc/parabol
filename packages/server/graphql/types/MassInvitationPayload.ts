import {GraphQLID, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import TeamInvitationErrorEnum from './TeamInvitationErrorEnum'

const MassInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'MassInvitationPayload',
  fields: () => ({
    errorType: {
      type: TeamInvitationErrorEnum
    },
    inviterName: {
      type: GraphQLString,
      description:
        'The name of the person that sent the invitation, present if errorType is expired'
    },
    inviterEmail: {
      type: GraphQLString,
      description:
        'The email of the person that sent the invitation, present if errorType is expired'
    },
    teamId: {
      type: GraphQLID,
      description: 'The teamId from the token'
    },
    teamName: {
      type: GraphQLString,
      description: 'name of the inviting team, present if invitation exists'
    }
    // meetingType: {
    // type: MeetingTypeEnum
    // }
  })
})

export default MassInvitationPayload
