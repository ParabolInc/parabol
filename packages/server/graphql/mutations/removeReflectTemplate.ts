import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {
  IReflectTemplate,
  IRetrospectiveMeetingSettings,
  MeetingTypeEnum
} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemoveReflectTemplatePayload from '../types/RemoveReflectTemplatePayload'

const removeReflectTemplate = {
  description: 'Remove a template full of prompts',
  type: RemoveReflectTemplatePayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await r
      .table('ReflectTemplate')
      .get(templateId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !isTeamMember(authToken, template.teamId) || !template.isActive) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const {templates, settings} = await r({
      templates: (r
        .table('ReflectTemplate')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .orderBy('name')
        .coerceTo('array') as unknown) as IReflectTemplate[],
      settings: (r
        .table('MeetingSettings')
        .getAll(teamId, {index: 'teamId'})
        .filter({meetingType: MeetingTypeEnum.retrospective})
        .nth(0) as unknown) as IRetrospectiveMeetingSettings
    }).run()

    // RESOLUTION
    const {id: settingsId} = settings
    await r({
      template: r
        .table('ReflectTemplate')
        .get(templateId)
        .update({isActive: false, updatedAt: now}),
      reflectPrompts: r
        .table('ReflectPrompt')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          templateId
        })
        .update({
          isActive: false,
          updatedAt: now
        })
    }).run()

    if (settings.selectedTemplateId === templateId) {
      const nextTemplate = templates.find((template) => template.id !== templateId)
      const nextTemplateId = nextTemplate?.id ?? 'workingStuckTemplate'
      await r
        .table('MeetingSettings')
        .get(settingsId)
        .update({
          selectedTemplateId: nextTemplateId
        })
        .run()
    }

    const data = {templateId, settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveReflectTemplatePayload', data, subOptions)
    return data
  }
}

export default removeReflectTemplate
