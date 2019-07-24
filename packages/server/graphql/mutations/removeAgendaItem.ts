import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import RemoveAgendaItemPayload from '../types/RemoveAgendaItemPayload'
import publish from '../../utils/publish'
import {TEAM} from '../../../universal/utils/constants'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import removeStagesFromNewMeeting from './helpers/removeStagesFromNewMeeting'
import AgendaItemsStage from '../../database/types/AgendaItemsStage'

export default {
  type: RemoveAgendaItemPayload,
  description: 'Remove an agenda item',
  args: {
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The agenda item unique id'
    }
  },
  async resolve (_source, {agendaItemId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    // id is of format 'teamId::shortid'
    const [teamId] = agendaItemId.split('::')
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const agendaItem = await r
      .table('AgendaItem')
      .get(agendaItemId)
      .delete({returnChanges: true})('changes')(0)('old_val')
      .default(null)
    if (!agendaItem) {
      return standardError(new Error('Agenda item not found'), {userId: viewerId})
    }
    const filterFn = (stage: AgendaItemsStage) => stage.agendaItemId === agendaItemId
    const meetingId = await removeStagesFromNewMeeting(filterFn, teamId, dataLoader)

    const data = {agendaItem, meetingId}
    publish(TEAM, teamId, RemoveAgendaItemPayload, data, subOptions)
    return data
  }
}
