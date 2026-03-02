import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isMeetingMember = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isMeetingMember`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const meetingId = getResolverDotPath(dotPath, source, args)
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!meetingMember) {
      return new GraphQLError(`Viewer is not meeting member`)
    }
    return true
  })
