import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdatedTeamInput from 'server/graphql/types/UpdatedTeamInput'
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload'
import {isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import updateTeamNameValidation from './helpers/updateTeamNameValidation'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation'

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
    if (!isTeamMember(authToken, updatedTeam.id)) {
      return sendTeamAccessError(authToken, updatedTeam.id)
    }

    // VALIDATION
    const {
      errors,
      data: {id: teamId, name}
    } = updateTeamNameValidation()(updatedTeam)
    if (Object.keys(errors).length) {
      return sendFailedInputValidation(authToken, errors)
    }

    // RESOLUTION
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
