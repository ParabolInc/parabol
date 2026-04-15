import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isMeetingMember = <T>(
  dotPath: ResolverDotPath<T>,
  dataLoaderName?: AllPrimaryLoaders
) =>
  rule(`isMeetingMember`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const argVar = getResolverDotPath(dotPath, source, args)
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    let meetingId: string = argVar
    if (dataLoaderName) {
      const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
      if (!subject?.meetingId)
        return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
      meetingId = subject.meetingId
    }
    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!meetingMember) {
      return new GraphQLError(`Viewer is not meeting member`)
    }
    if (context.resourceGrants) {
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (!meeting) return new GraphQLError(`Meeting not found`)
      if (!(await context.resourceGrants.hasTeam(meeting.teamId))) {
        return new GraphQLError(`PAT does not grant access to this team`)
      }
    }
    return true
  })
