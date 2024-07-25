import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import AgendaItemsStage from '../../database/types/AgendaItemsStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
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
  async resolve(
    _source: unknown,
    {agendaItemId}: {agendaItemId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    // id is of format 'teamId::randomId'
    const [teamId] = agendaItemId.split('::') as [string]
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const agendaItem = await r
      .table('AgendaItem')
      .get(agendaItemId)
      .update({isActive: false}, {returnChanges: true})('changes')(0)('old_val')
      .default(null)
      .run()
    if (!agendaItem) {
      return standardError(new Error('Agenda item not found'), {userId: viewerId})
    }
    const filterFn = (stage: AgendaItemsStage) => stage.agendaItemId === agendaItemId
    await removeStagesFromMeetings(filterFn, teamId, dataLoader)
    const data = {agendaItem, meetingId: agendaItem.meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveAgendaItemPayload', data, subOptions)
    return data
  }
}
