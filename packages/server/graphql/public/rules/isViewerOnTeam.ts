import {rule} from 'graphql-shield'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

type GetTeamId = (source: any, args: any, context: GQLContext) => Promise<string | Error>

const isViewerOnTeam = (getTeamId: GetTeamId) =>
  rule(`isViewerOnTeam-${getTeamId.name || getTeamId}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const {authToken, dataLoader} = context
      const viewerId = getUserId(authToken)
      const teamId = await getTeamId(source, args, context)
      if (teamId instanceof Error) return teamId
      const teamMemberId = TeamMemberId.join(teamId, viewerId)
      const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
      if (!teamMember) return new Error('Viewer is not on team')
      return true
    }
  )

export default isViewerOnTeam
