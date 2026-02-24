import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const selectTemplate: MutationResolvers['selectTemplate'] = async (
  _source,
  {selectedTemplateId, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // AUTH
  const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)

  if (!template || !template.isActive) {
    Logger.log('no template', selectedTemplateId, template)
    return standardError(new Error('Template not found'), {
      userId: viewerId
    })
  }

  const {scope} = template
  const viewerTeam = await dataLoader.get('teams').loadNonNull(teamId)
  if (scope === 'TEAM') {
    if (!isTeamMember(authToken, template.teamId))
      return standardError(new Error('Template is scoped to team'), {
        userId: viewerId
      })
  } else if (scope === 'ORGANIZATION') {
    const templateTeam = await dataLoader.get('teams').loadNonNull(template.teamId)
    if (viewerTeam.orgId !== templateTeam.orgId) {
      return standardError(new Error('Template is scoped to organization'), {
        userId: viewerId
      })
    }
  }

  // RESOLUTION
  const meetingSettings = await getKysely()
    .updateTable('MeetingSettings')
    .set({selectedTemplateId})
    .where('teamId', '=', teamId)
    .where('meetingType', '=', template.type)
    .returning('id')
    .executeTakeFirst()

  if (!meetingSettings) {
    return standardError(new Error('Failed to update meeting settings with selected template'), {
      userId: viewerId
    })
  }

  const data = {meetingSettingsId: meetingSettings.id}
  publish(SubscriptionChannel.TEAM, teamId, 'SelectTemplatePayload', data, subOptions)
  return data
}

export default selectTemplate
