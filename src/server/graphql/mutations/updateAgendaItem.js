import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdateAgendaItemInput from 'server/graphql/types/UpdateAgendaItemInput'
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {AGENDA_ITEM} from 'universal/utils/constants'
import makeUpdateAgendaItemSchema from 'universal/validation/makeUpdateAgendaItemSchema'
import standardError from 'server/utils/standardError'

export default {
  type: UpdateAgendaItemPayload,
  description: 'Update an agenda item',
  args: {
    updatedAgendaItem: {
      type: new GraphQLNonNull(UpdateAgendaItemInput),
      description: 'The updated item including an id, content, status, sortOrder'
    }
  },
  async resolve (source, {updatedAgendaItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const now = new Date()
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const {id: agendaItemId} = updatedAgendaItem
    const [teamId] = agendaItemId.split('::')
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const schema = makeUpdateAgendaItemSchema()
    const {
      errors,
      data: {id, ...doc}
    } = schema(updatedAgendaItem)
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('AgendaItem')
      .get(id)
      .update({
        ...doc,
        updatedAt: now
      })

    const data = {agendaItemId}
    publish(AGENDA_ITEM, teamId, UpdateAgendaItemPayload, data, subOptions)
    return data
  }
}
