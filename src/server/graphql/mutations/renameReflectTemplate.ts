import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import RenameReflectTemplatePayload from '../types/RenameReflectTemplatePayload'

const renameReflectTemplatePrompt = {
  description: 'Rename a reflect template prompt',
  type: RenameReflectTemplatePayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve (_source, {templateId, name}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await r.table('ReflectTemplate').get(templateId)

    // AUTH
    if (!template || !isTeamMember(authToken, template.teamId) || !template.isActive) {
      return sendTeamAccessError(authToken, templateId)
    }

    // VALIDATION
    const normalizedName = name.trim().slice(0, 100)

    // RESOLUTION
    await r
      .table('ReflectTemplate')
      .get(templateId)
      .update({name: normalizedName, updatedAt: now})

    const {teamId} = template
    const data = {templateId}
    publish(TEAM, teamId, RenameReflectTemplatePayload, data, subOptions)
    return data
  }
}

export default renameReflectTemplatePrompt
