import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import standardError from '../../utils/standardError'
import MoveReflectTemplatePromptPayload from '../types/MoveReflectTemplatePromptPayload'

const moveReflectTemplate = {
  description: 'Move a reflect template',
  type: MoveReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve (_source, {promptId, sortOrder}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await r.table('CustomPhaseItem').get(promptId)
    const viewerId = getUserId(authToken)

    // AUTH
    if (!prompt || !isTeamMember(authToken, prompt.teamId) || !prompt.isActive) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('CustomPhaseItem')
      .get(promptId)
      .update({
        sortOrder,
        updatedAt: now
      })

    const {teamId} = prompt
    const data = {promptId}
    publish(TEAM, teamId, MoveReflectTemplatePromptPayload, data, subOptions)
    return data
  }
}

export default moveReflectTemplate
