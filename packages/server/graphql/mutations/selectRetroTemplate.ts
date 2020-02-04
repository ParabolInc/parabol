import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import SelectRetroTemplatePayload from '../types/SelectRetroTemplatePayload'

const selectRetroTemplate = {
  description: 'Set the selected template for the upcoming retro meeting',
  type: SelectRetroTemplatePayload,
  args: {
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source,
    {selectedTemplateId, teamId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const template = await r
      .table('ReflectTemplate')
      .get(selectedTemplateId)
      .run()
    if (!template || template.teamId !== teamId || !template.isActive) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    // RESOLUTION
    const meetingSettingsId = await r
      .table('MeetingSettings')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        meetingType: MeetingTypeEnum.retrospective
      })
      .update(
        {
          selectedTemplateId
        },
        {returnChanges: true}
      )('changes')(0)('new_val')('id')
      .default(null)
      .run()

    if (!meetingSettingsId) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    const data = {meetingSettingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'SelectRetroTemplatePayload', data, subOptions)
    return data
  }
}

export default selectRetroTemplate
