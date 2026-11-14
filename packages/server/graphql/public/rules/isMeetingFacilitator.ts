import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getRuleViewerId} from '../../../utils/authorization'
import type {RuleContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isMeetingFacilitator = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isMeetingFacilitator`, {cache: 'strict'})(async (source, args, context: RuleContext) => {
    const meetingId = getResolverDotPath(dotPath, source, args)
    const {dataLoader, authToken} = context
    const viewerId = getRuleViewerId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return new GraphQLError(`Meeting not found`, {extensions: {code: 'NOT_FOUND'}})
    }
    if (viewerId !== meeting.facilitatorUserId) {
      return new GraphQLError(`Viewer is not meeting facilitator`, {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (context.resourceGrants && !(await context.resourceGrants.hasTeam(meeting.teamId))) {
      return new GraphQLError(`PAT does not grant access to this team`, {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    return true
  })
