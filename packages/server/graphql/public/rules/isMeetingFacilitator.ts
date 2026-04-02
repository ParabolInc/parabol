import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isMeetingFacilitator = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isMeetingFacilitator`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const meetingId = getResolverDotPath(dotPath, source, args)
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return new GraphQLError(`Meeting not found`)
    }
    if (viewerId !== meeting.facilitatorUserId) {
      return new GraphQLError(`Viewer is not meeting facilitator`)
    }
    return true
  })
