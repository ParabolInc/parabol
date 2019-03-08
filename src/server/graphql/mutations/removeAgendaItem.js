import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload'
import publish from 'server/utils/publish'
import {AGENDA_ITEM} from 'universal/utils/constants'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'

export default {
  type: RemoveAgendaItemPayload,
  description: 'Remove an agenda item',
  args: {
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The agenda item unique id'
    }
  },
  async resolve(source, {agendaItemId}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const data = {agendaItem}
    publish(AGENDA_ITEM, teamId, RemoveAgendaItemPayload, data, subOptions)
    return data
  }
}
