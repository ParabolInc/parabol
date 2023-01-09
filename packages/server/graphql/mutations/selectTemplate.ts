import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SelectTemplatePayload from '../types/SelectTemplatePayload'

const selectTemplate = {
  description: 'Set the selected template for the upcoming retro meeting',
  type: SelectTemplatePayload,
  args: {
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {selectedTemplateId, teamId}: {selectedTemplateId: string; teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)
    const user = await dataLoader.get('users').loadNonNull(viewerId)
    const {featureFlags} = user

    // AUTH
    const template = (await dataLoader
      .get('meetingTemplates')
      .load(selectedTemplateId)) as MeetingTemplate

    if (!template || !template.isActive) {
      console.log('no template', selectedTemplateId, template)
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    const {scope, isFree} = template
    const viewerTeam = await dataLoader.get('teams').loadNonNull(teamId)
    if (scope === 'TEAM') {
      if (!isTeamMember(authToken, template.teamId))
        return standardError(new Error('Template is scoped to team'), {userId: viewerId})
    } else if (scope === 'ORGANIZATION') {
      const templateTeam = await dataLoader.get('teams').loadNonNull(template.teamId)
      if (viewerTeam.orgId !== templateTeam.orgId) {
        return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
      }
    } else if (scope === 'PUBLIC') {
      if (featureFlags.includes('templateLimit') && !isFree && viewerTeam.tier === 'starter') {
        return standardError(new Error('User does not have access to this premium template'), {
          userId: viewerId
        })
      }
    }

    // RESOLUTION
    const meetingSettingsId = await r
      .table('MeetingSettings')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        meetingType: template.type
      })
      .update(
        {
          selectedTemplateId
        },
        {returnChanges: true}
      )('changes')(0)('old_val')('id')
      .default(null)
      .run()

    if (!meetingSettingsId) {
      return standardError(new Error('Template already updated'), {userId: viewerId})
    }

    const data = {meetingSettingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'SelectTemplatePayload', data, subOptions)
    return data
  }
}

export default selectTemplate
