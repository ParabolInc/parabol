import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isTeamMemberOfMeeting = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isTeamMemberOfMeeting`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const meetingId = getResolverDotPath(dotPath, source, args)
    const {dataLoader, authToken} = context

    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return new GraphQLError(`Meeting not found`)
    }
    // All team members can join a meeting, so let them interact with it even if no team member exists yet. This allows for creation of reflections beforehand
    if (!authToken.tms.includes(meeting.teamId)) {
      return new GraphQLError(`Viewer is not on team`)
    }
    return true
  })
