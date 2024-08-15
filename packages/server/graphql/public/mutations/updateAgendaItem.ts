import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import makeUpdateAgendaItemSchema from 'parabol-client/validation/makeUpdateAgendaItemSchema'
import getRethink from '../../../database/rethinkDriver'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateAgendaItem: MutationResolvers['updateAgendaItem'] = async (
  _source,
  {updatedAgendaItem},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const {id: agendaItemId} = updatedAgendaItem
  const [teamId] = agendaItemId.split('::') as [string]
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // VALIDATION
  const schema = makeUpdateAgendaItemSchema()
  const {
    errors,
    data: {id, ...doc}
  } = schema(updatedAgendaItem) as any
  if (Object.keys(errors).length) {
    return standardError(new Error('Failed input validation'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('AgendaItem')
    .set({pinned: doc.pinned, content: doc.content, sortOrder: doc.sortOrder})
    .where('id', '=', id)
    .execute()

  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const actionMeeting = activeMeetings.find(
    (activeMeeting) => activeMeeting.meetingType === 'action'
  )
  const meetingId = actionMeeting?.id ?? null
  if (actionMeeting) {
    const {id: meetingId, phases} = actionMeeting
    const agendaItemPhase = getPhase(phases, 'agendaitems')
    const {stages} = agendaItemPhase
    const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
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
      .run()
  }
  const data = {agendaItemId, meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateAgendaItemPayload', data, subOptions)
  return data
}

export default updateAgendaItem
