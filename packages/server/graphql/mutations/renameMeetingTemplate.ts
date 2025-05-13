import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import updateMeetingTemplateName from '../../postgres/queries/updateMeetingTemplateName'
import {getUserId, isTeamMemberOrOrgAdmin} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RenameMeetingTemplatePayload from '../types/RenameMeetingTemplatePayload'

const renameMeetingTemplate = {
  description: 'Rename a meeting template',
  type: RenameMeetingTemplatePayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(
    _source: unknown,
    {templateId, name}: {templateId: string; name: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = (await dataLoader.get('meetingTemplates').load(templateId)) as MeetingTemplate
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !template.isActive) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }
    const isAuthorized = await isTeamMemberOrOrgAdmin(authToken, template.teamId, dataLoader)
    if (!isAuthorized) {
      return standardError(new Error('Unauthorized: requires team membership or org admin status'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const trimmedName = name.trim().slice(0, 100)
    const normalizedName = trimmedName || 'Unnamed Template'
    const allTemplates = await dataLoader
      .get('meetingTemplatesByType')
      .load({meetingType: template.type, teamId})
    dataLoader.get('meetingTemplatesByType').clearAll()
    if (allTemplates.find((template) => template.name === normalizedName)) {
      return standardError(new Error('Duplicate template name'), {userId: viewerId})
    }

    // RESOLUTION
    template.name = normalizedName
    await updateMeetingTemplateName(templateId, normalizedName)

    const data = {templateId}
    publish(SubscriptionChannel.TEAM, teamId, 'RenameMeetingTemplatePayload', data, subOptions)
    return data
  }
}

export default renameMeetingTemplate