import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SelectTemplatePayload from '../types/SelectTemplatePayload'
import {getFeatureTier} from '../types/helpers/getFeatureTier'
import {Logger} from '../../utils/Logger'

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

    // AUTH
    const [template, viewer] = await Promise.all([
      dataLoader.get('meetingTemplates').load(selectedTemplateId) as Promise<MeetingTemplate>,
      dataLoader.get('users').loadNonNull(viewerId)
    ])

    if (!template || !template.isActive) {
      Logger.log('no template', selectedTemplateId, template)
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
      if (
        !isFree &&
        !viewer.featureFlags.includes('noTemplateLimit') &&
        getFeatureTier(viewerTeam) === 'starter'
      ) {
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

    // No need to check if a non-null 'meetingSettingsId' was returned - the Activity Library client
    // will always attempt to update the template, even if it's already selected, and we don't need
    // to return a 'meetingSettingsId' if no updates took place.

    const data = {meetingSettingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'SelectTemplatePayload', data, subOptions)
    return data
  }
}

export default selectTemplate
