import crypto from 'crypto'
import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import util from 'util'
import {EMAIL_CORS_OPTIONS} from '../../../client/types/cors'
import {isNotNull} from '../../../client/utils/predicates'
import appOrigin from '../../appOrigin'
import getRethink from '../../database/rethinkDriver'
import NotificationTeamInvitation from '../../database/types/NotificationTeamInvitation'
import TeamInvitation from '../../database/types/TeamInvitation'
import getMailManager from '../../email/getMailManager'
import teamInviteEmailCreator from '../../email/teamInviteEmailCreator'
import {getUsersByEmails} from '../../postgres/queries/getUsersByEmails'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import getBestInvitationMeeting from '../../utils/getBestInvitationMeeting'
import getDomainFromEmail from '../../utils/getDomainFromEmail'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import getIsEmailApprovedByOrg from '../public/mutations/helpers/getIsEmailApprovedByOrg'
import rateLimit from '../rateLimit'
import GraphQLEmailType from '../types/GraphQLEmailType'
import inviteToTeamHelper from './helpers/inviteToTeamHelper'

export default {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'InviteToTeamPayload',
      fields: {}
    })
  ),
  description: 'Send a team invitation to an email address',
  args: {
    meetingId: {
      type: GraphQLID,
      description: 'the specific meeting where the invite occurred, if any'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLEmailType)))
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(
    async (
      _source: unknown,
      {
        invitees: inviteesInput,
        meetingId,
        teamId
      }: {invitees: string[]; meetingId?: string | null; teamId: string},
      context: GQLContext
    ) => {
      const {authToken} = context

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }

      const data = await inviteToTeamHelper(inviteesInput, teamId, context, meetingId)
      return data
    }
  )
}
