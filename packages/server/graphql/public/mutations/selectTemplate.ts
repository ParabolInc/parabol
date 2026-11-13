import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {isTeamMember} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const selectTemplate: MutationResolvers['selectTemplate'] = async (
  _source,
  {selectedTemplateId, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)

  if (!template || !template.isActive) {
    Logger.log('no template', selectedTemplateId, template)
    throw new GraphQLError('Template not found', {extensions: {code: 'NOT_FOUND'}})
  }

  const {scope} = template
  const viewerTeam = await dataLoader.get('teams').loadNonNull(teamId)
  if (scope === 'TEAM') {
    if (!isTeamMember(authToken, template.teamId))
      throw new GraphQLError('Template is scoped to team', {extensions: {code: 'FORBIDDEN'}})
  } else if (scope === 'ORGANIZATION') {
    const templateTeam = await dataLoader.get('teams').loadNonNull(template.teamId)
    if (viewerTeam.orgId !== templateTeam.orgId) {
      throw new GraphQLError('Template is scoped to organization', {
        extensions: {code: 'FORBIDDEN'}
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
    throw new GraphQLError('Failed to update meeting settings with selected template', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }

  const data = {meetingSettingsId: meetingSettings.id}
  publish(SubscriptionChannel.TEAM, teamId, 'SelectTemplatePayload', data, subOptions)
  return data
}

export default selectTemplate
