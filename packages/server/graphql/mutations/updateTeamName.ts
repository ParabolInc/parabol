import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import teamNameValidation from 'parabol-client/validation/teamNameValidation'
import getTeamsByIds from '../../postgres/queries/getTeamsByIds'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdatedTeamInput, {UpdatedTeamInputType} from '../types/UpdatedTeamInput'
import UpdateTeamNamePayload from '../types/UpdateTeamNamePayload'
import {DEFAULT_TEAM_NAMES} from 'parabol-client/utils/makeDefaultTeamName'

export default {
  type: UpdateTeamNamePayload,
  args: {
    updatedTeam: {
      type: new GraphQLNonNull(UpdatedTeamInput),
      description: 'The input object containing the teamId and any modified fields'
    }
  },
  async resolve(
    _source: unknown,
    {updatedTeam}: {updatedTeam: UpdatedTeamInputType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const teamId = updatedTeam.id
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('User not on team'), {userId: viewerId})
    }

    // VALIDATION
    const teams = await getTeamsByIds([teamId])
    const team = teams[0]!
    const oldName = team.name
    const newName = updatedTeam.name
    const orgTeams = await dataLoader.get('teamsByOrgIds').load(team.orgId)
    const orgTeamNames = orgTeams.filter((team) => team.id !== teamId).map((team) => team.name)
    const {error, value: name} = teamNameValidation(newName, orgTeamNames)
    if (error) {
      return standardError(new Error('Failed validation'), {userId: viewerId})
    }

    // RESOLUTION
    // update the dataLoader cache
    const cachedTeam = orgTeams.find((team) => team.id === teamId)!
    cachedTeam.name = name
    const dbUpdate = {
      name,
      updatedAt: now
    }
    await updateTeamByTeamId(dbUpdate, teamId)
    analytics.teamNameChanged(
      viewerId,
      teamId,
      oldName,
      newName,
      DEFAULT_TEAM_NAMES.includes(oldName)
    )

    const data = {teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateTeamNamePayload', data, subOptions)
    return data
  }
}
