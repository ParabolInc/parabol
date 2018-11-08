import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdatedTeamInput from 'server/graphql/types/UpdatedTeamInput'
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload'
import {isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation'
import teamNameValidation from 'universal/validation/teamNameValidation'

export default {
  type: UpdateTeamNamePayload,
  args: {
    updatedTeam: {
      type: new GraphQLNonNull(UpdatedTeamInput),
      description: 'The input object containing the teamId and any modified fields'
    }
  },
  async resolve (source, {updatedTeam}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const teamId = updatedTeam.id
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    const team = await r.table('Team').get(teamId)
    const orgTeams = await dataLoader.get('teamsByOrgId').load(team.orgId)
    const orgTeamNames = orgTeams.filter((team) => team.id !== teamId).map((team) => team.name)
    const {error, value: name} = teamNameValidation(updatedTeam.name, orgTeamNames)
    if (error) {
      return sendFailedInputValidation(authToken, error)
    }

    // RESOLUTION
    // update the dataLoader cache
    const cachedTeam = orgTeams.find((team) => team.id === teamId)
    cachedTeam.name = name
    const dbUpdate = {
      name,
      updatedAt: now
    }
    await r
      .table('Team')
      .get(teamId)
      .update(dbUpdate)

    const data = {teamId}
    publish(TEAM, teamId, UpdateTeamNamePayload, data, subOptions)
    return data
  }
}
