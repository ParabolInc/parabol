import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdateAgendaItemInput from 'server/graphql/types/UpdateAgendaItemInput'
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {ACTION, AGENDA_ITEMS, TEAM} from 'universal/utils/constants'
import makeUpdateAgendaItemSchema from 'universal/validation/makeUpdateAgendaItemSchema'
import standardError from 'server/utils/standardError'
import Meeting from 'server/database/types/Meeting'
import {GQLContext} from 'server/graphql/graphql'
import AgendaItemsStage from 'server/database/types/AgendaItemsStage'
import {IAgendaItem} from 'universal/types/graphql'
import AgendaItemsPhase from 'server/database/types/AgendaItemsPhase'

export default {
  type: UpdateAgendaItemPayload,
  description: 'Update an agenda item',
  args: {
    updatedAgendaItem: {
      type: new GraphQLNonNull(UpdateAgendaItemInput),
      description: 'The updated item including an id, content, status, sortOrder'
    }
  },
  async resolve (
    _source,
    {updatedAgendaItem},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
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
    const team = await dataLoader.get('teams').load(teamId)
    const {meetingId} = team
    if (meetingId) {
      const meeting = (await r.table('NewMeeting').get(meetingId)) as Meeting | null
      if (!meeting || meeting.meetingType !== ACTION) {
        return standardError(new Error('Invalid meetingId'))
      }
      const {phases} = meeting
      const agendaItemPhase = phases.find(
        (phase) => phase.phaseType === AGENDA_ITEMS
      )! as AgendaItemsPhase
      const {stages} = agendaItemPhase
      const agendaItems = (await dataLoader
        .get('agendaItemsByTeamId')
        .load(teamId)) as IAgendaItem[]
      const getSortOrder = (stage: AgendaItemsStage) => {
        const agendaItem = agendaItems.find((item) => item.id === stage.agendaItemId)
        return (agendaItem && agendaItem.sortOrder) || 0
      }
      stages.sort((a, b) => (getSortOrder(a) > getSortOrder(b) ? 1 : -1))
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases
        })
    }
    const data = {agendaItemId, meetingId}
    publish(TEAM, teamId, UpdateAgendaItemPayload, data, subOptions)
    return data
  }
}
