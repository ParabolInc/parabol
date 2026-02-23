import {rule} from 'graphql-shield'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isMeetingMember = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isMeetingMember`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const meetingId = getResolverDotPath(dotPath, source, args)
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)

    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)

    if (!viewerMeetingMember) {
      return `Viewer is not a member of the meeting`
    }
    return true
  })
