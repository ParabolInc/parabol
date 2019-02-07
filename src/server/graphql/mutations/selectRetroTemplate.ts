import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import SelectRetroTemplatePayload from 'server/graphql/types/SelectRetroTemplatePayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {RETROSPECTIVE, TEAM} from 'universal/utils/constants'
import standardError from '../../utils/standardError'

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
  async resolve (
    _source,
    {selectedTemplateId, teamId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const template = await r.table('ReflectTemplate').get(selectedTemplateId)
    if (!template || template.teamId !== teamId) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    // RESOLUTION
    const meetingSettingsId = await r
      .table('MeetingSettings')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        meetingType: RETROSPECTIVE
      })
      .update(
        {
          selectedTemplateId
        },
        {returnChanges: true}
      )('changes')(0)('new_val')('id')
      .default(null)

    if (!meetingSettingsId) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    const data = {meetingSettingsId}
    publish(TEAM, teamId, SelectRetroTemplatePayload, data, subOptions)
    return data
  }
}

export default selectRetroTemplate
