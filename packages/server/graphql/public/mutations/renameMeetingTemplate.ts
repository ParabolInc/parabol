import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import updateMeetingTemplateName from '../../../postgres/queries/updateMeetingTemplateName'
import {getUserId, isTeamMember, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const renameMeetingTemplate: MutationResolvers['renameMeetingTemplate'] = async (
  _source,
  {templateId, name},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  const viewerId = getUserId(authToken)

  // AUTH
  if (!template || !template.isActive) {
    return standardError(new Error('Template not found'), {userId: viewerId})
  }
  if (
    !isTeamMember(authToken, template.teamId) &&
    !(await isUserOrgAdmin(viewerId, template.orgId, dataLoader))
  ) {
    return standardError(new Error('You are not authorized to rename this template'), {
      userId: viewerId
    })
  }

  // VALIDATION
  const {teamId} = template
  const trimmedName = name.trim().slice(0, 100)
  const normalizedName = trimmedName || 'Unnamed Template'
  const allTemplates = await dataLoader
    .get('meetingTemplatesByType')
    .load({meetingType: template.type, teamId})
  dataLoader.get('meetingTemplatesByType').clearAll()
  if (allTemplates.find((t) => t.name === normalizedName)) {
    return standardError(new Error('Duplicate template name'), {userId: viewerId})
  }

  // RESOLUTION
  template.name = normalizedName
  await updateMeetingTemplateName(templateId, normalizedName)

  const data = {templateId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenameMeetingTemplatePayload', data, subOptions)
  return data
}

export default renameMeetingTemplate
