import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import teamNameValidation from 'parabol-client/validation/teamNameValidation'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateTeamName: MutationResolvers['updateTeamName'] = async (
  _source,
  {updatedTeam},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const teamId = updatedTeam.id
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const newName = updatedTeam.name
  const orgTeams = await dataLoader.get('teamsByOrgIds').load(team.orgId)
  const orgTeamNames = orgTeams.filter((team) => team.id !== teamId).map((team) => team.name)
  const {error, value: name} = teamNameValidation(newName, orgTeamNames)
  if (error) throw new GraphQLError('Failed validation', {extensions: {code: 'BAD_USER_INPUT'}})

  // RESOLUTION
  const cachedTeam = orgTeams.find((team) => team.id === teamId)!
  cachedTeam.name = name
  await getKysely().updateTable('Team').set({name}).where('id', '=', teamId).execute()
  dataLoader.clearAll('teams')

  const data = {teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateTeamNamePayload', data, subOptions)
  return data
}

export default updateTeamName
