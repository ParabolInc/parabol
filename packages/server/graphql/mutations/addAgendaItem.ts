import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import makeAgendaItemSchema from 'parabol-client/validation/makeAgendaItemSchema'
import getRethink from '../../database/rethinkDriver'
import AgendaItem, {AgendaItemInput} from '../../database/types/AgendaItem'
import generateUID from '../../generateUID'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import AddAgendaItemPayload from '../types/AddAgendaItemPayload'
import CreateAgendaItemInput, {CreateAgendaItemInputType} from '../types/CreateAgendaItemInput'
import {GQLContext} from './../graphql'
import addAgendaItemToActiveActionMeeting from './helpers/addAgendaItemToActiveActionMeeting'

export default {
  type: AddAgendaItemPayload,
  description: 'Create a new agenda item',
  args: {
    newAgendaItem: {
      type: new GraphQLNonNull(CreateAgendaItemInput),
      description: 'The new task including an id, teamMemberId, and content'
    }
  },
  async resolve(
    _source: unknown,
    {newAgendaItem}: {newAgendaItem: CreateAgendaItemInputType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
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
      console.log(errors)
      return standardError(new Error('Failed input validation'), {userId: viewerId})
    }

    console.log(validNewAgendaItem)

    // RESOLUTION
    const agendaItemId = `${teamId}::${generateUID()}`
    await r
      .table('AgendaItem')
      .insert(
        new AgendaItem({
          ...validNewAgendaItem,
          id: agendaItemId,
          teamId
        } as AgendaItemInput)
      )
      .run()

    const meetingId = await addAgendaItemToActiveActionMeeting(agendaItemId, teamId, dataLoader)
    segmentIo.track({
      userId: viewerId,
      event: 'Added Agenda Item',
      properties: {
        teamId,
        meetingId
      }
    })
    const data = {agendaItemId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddAgendaItemPayload', data, subOptions)
    return data
  }
}
