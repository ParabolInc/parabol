import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload'
import CreateAgendaItemInput from 'server/graphql/types/CreateAgendaItemInput'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {AGENDA_ITEM} from 'universal/utils/constants'
import makeAgendaItemSchema from 'universal/validation/makeAgendaItemSchema'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation'

export default {
  type: AddAgendaItemPayload,
  description: 'Create a new agenda item',
  args: {
    newAgendaItem: {
      type: new GraphQLNonNull(CreateAgendaItemInput),
      description: 'The new task including an id, teamMemberId, and content'
    }
  },
  async resolve (source, {newAgendaItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const {teamId} = newAgendaItem
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    const schema = makeAgendaItemSchema()
    const {errors, data: validNewAgendaItem} = schema(newAgendaItem)
    if (Object.keys(errors).length) {
      return sendFailedInputValidation(authToken, errors)
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
    publish(AGENDA_ITEM, teamId, AddAgendaItemPayload, data, subOptions)
    return data
  }
}
