import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import AgendaItemsStage from '../../database/types/AgendaItemsStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemoveAgendaItemPayload from '../types/RemoveAgendaItemPayload'
import removeStagesFromMeetings from './helpers/removeStagesFromMeetings'

export default {
  type: RemoveAgendaItemPayload,
  description: 'Remove an agenda item',
  args: {
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The agenda item unique id'
    }
  },
  async resolve(_source, {agendaItemId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    // id is of format 'teamId::randomId'
    const [teamId] = agendaItemId.split('::')
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const agendaItem = await r
      .table('AgendaItem')
      .get(agendaItemId)
      .update(
        {isActive: false},
        {returnChanges: true}
      )('changes')(0)('old_val')
      .default(null)
      .run()
    if (!agendaItem) {
      return standardError(new Error('Agenda item not found'), {userId: viewerId})
    }
    const filterFn = (stage: AgendaItemsStage) => stage.agendaItemId === agendaItemId
    const meetingIds = await removeStagesFromMeetings(filterFn, teamId, dataLoader)
    // safe to do so because we guarantee only 1 action meeting at the same time
    const [meetingId] = meetingIds
    const data = {agendaItem, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveAgendaItemPayload', data, subOptions)
    return data
  }
}
