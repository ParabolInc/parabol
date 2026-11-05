import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import getReportScope from '../../../reports/getReportScope'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

// a Team Health check whose results are out, held by a team the viewer can report on in the organization
export const isReportTeamHealthCheck = <T>(
  orgIdDotPath: ResolverDotPath<T>,
  meetingIdDotPath: ResolverDotPath<T>
) =>
  rule(`isReportTeamHealthCheck-${orgIdDotPath}-${meetingIdDotPath}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const meetingId = getResolverDotPath(meetingIdDotPath, source, args)
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (meeting?.meetingType !== 'teamHealth' || !meeting.endedAt) {
        return new GraphQLError('Team Health check not found')
      }
      const {teams} = await getReportScope({
        orgId,
        viewerId: getUserId(authToken),
        isSuperUser: isSuperUser(authToken),
        dataLoader
      })
      if (!teams.some(({id}) => id === meeting.teamId)) {
        return new GraphQLError('Viewer cannot report on this team')
      }
      return true
    }
  )
