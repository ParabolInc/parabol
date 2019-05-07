import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload'
import CreateAgendaItemInput from 'server/graphql/types/CreateAgendaItemInput'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {TEAM} from 'universal/utils/constants'
import makeAgendaItemSchema from 'universal/validation/makeAgendaItemSchema'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'

export default {
  type: AddAgendaItemPayload,
  description: 'Create a new agenda item',
  args: {
    newAgendaItem: {
      type: new GraphQLNonNull(CreateAgendaItemInput),
      description: 'The new task including an id, teamMemberId, and content'
    }
  },
  async resolve (_source, {newAgendaItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    // AUTH
    const {teamId} = newAgendaItem
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const schema = makeAgendaItemSchema()
    const {errors, data: validNewAgendaItem} = schema(newAgendaItem)
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId: viewerId})
    }

    // RESOLUTION
    const now = new Date()
    const agendaItemId = `${teamId}::${shortid.generate()}`
    await r.table('AgendaItem').insert({
      id: agendaItemId,
      ...validNewAgendaItem,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      isComplete: false,
      teamId
    })

    const data = {agendaItemId}
    publish(TEAM, teamId, AddAgendaItemPayload, data, subOptions)
    return data
  }
}
