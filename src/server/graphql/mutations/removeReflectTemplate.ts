import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {sendLastTemplateRemovalError, sendTeamAccessError} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import RemoveReflectTemplatePayload from '../types/RemoveReflectTemplatePayload'

const removeReflectTemplate = {
  description: 'Remove a template full of prompts',
  type: RemoveReflectTemplatePayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve (_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const {teamId} = template
    const allTemplatesCount = await r
      .table('ReflectTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .count()
      .default(0)

    if (allTemplatesCount.length <= 1) {
      return sendLastTemplateRemovalError(authToken, templateId)
    }

    // RESOLUTION
    await r({
      template: r
        .table('ReflectTemplate')
        .get(templateId)
        .update({isActive: false, updatedAt: now}),
      phaseItems: r
        .table('CustomPhaseItem')
        .getAll(teamId, {index: teamId})
        .filter({
          templateId
        })
        .update({
          isActive: false,
          updatedAt: now
        })
    })

    const data = {templateId}
    publish(TEAM, teamId, RemoveReflectTemplatePayload, data, subOptions)
    return data
  }
}

export default removeReflectTemplate
