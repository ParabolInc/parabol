import {GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import AddAgendaItemPayload from '../types/AddAgendaItemPayload'
import CreateAgendaItemInput from '../types/CreateAgendaItemInput'
import publish from '../../utils/publish'
import shortid from 'shortid'
import makeAgendaItemSchema from 'parabol-client/validation/makeAgendaItemSchema'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import addAgendaItemToActiveActionMeeting from './helpers/addAgendaItemToActiveActionMeeting'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: AddAgendaItemPayload,
  description: 'Create a new agenda item',
  args: {
    newAgendaItem: {
      type: new GraphQLNonNull(CreateAgendaItemInput),
      description: 'The new task including an id, teamMemberId, and content'
    }
  },
  async resolve(_source, {newAgendaItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
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
    await r
      .table('AgendaItem')
      .insert({
        id: agendaItemId,
        ...validNewAgendaItem,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        isComplete: false,
        teamId
      })
      .run()

    const meetingId = await addAgendaItemToActiveActionMeeting(agendaItemId, teamId, dataLoader)
    const data = {agendaItemId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddAgendaItemPayload', data, subOptions)
    return data
  }
}
