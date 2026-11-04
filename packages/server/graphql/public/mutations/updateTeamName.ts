import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import teamNameValidation from 'parabol-client/validation/teamNameValidation'
import {teamRenames} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const updateTeamName: MutationResolvers['updateTeamName'] = async (
  _source,
  {updatedTeam},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  const teamId = updatedTeam.id
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const oldName = team.name
  const newName = updatedTeam.name
  const orgTeams = await dataLoader.get('teamsByOrgIds').load(team.orgId)
  const orgTeamNames = orgTeams.filter((team) => team.id !== teamId).map((team) => team.name)
  const {error, value: name} = teamNameValidation(newName, orgTeamNames)
  if (error) return standardError(new Error('Failed validation'), {userId: viewerId})

  // RESOLUTION
  const cachedTeam = orgTeams.find((team) => team.id === teamId)!
  cachedTeam.name = name
  await getKysely().updateTable('Team').set({name}).where('id', '=', teamId).execute()
  dataLoader.clearAll('teams')
  teamRenames.inc({from_default_name: String(oldName.endsWith('\u2019s Team'))})

  const data = {teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateTeamNamePayload', data, subOptions)
  return data
}

export default updateTeamName
