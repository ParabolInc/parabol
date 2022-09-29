import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import MoveReflectTemplatePromptPayload from '../types/MoveReflectTemplatePromptPayload'

const moveReflectTemplate = {
  description: 'Move a reflect template',
  type: MoveReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve(
    _source: unknown,
    {promptId, sortOrder}: {promptId: string; sortOrder: number},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await r.table('ReflectPrompt').get(promptId).run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!prompt || prompt.removedAt) {
      return standardError(new Error('Prompt not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, prompt.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('ReflectPrompt')
      .get(promptId)
      .update({
        sortOrder,
        updatedAt: now
      })
      .run()

    const {teamId} = prompt
    const data = {promptId}
    publish(SubscriptionChannel.TEAM, teamId, 'MoveReflectTemplatePromptPayload', data, subOptions)
    return data
  }
}

export default moveReflectTemplate
