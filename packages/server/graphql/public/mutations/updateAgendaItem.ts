import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateAgendaItem: MutationResolvers['updateAgendaItem'] = async (
  _source,
  {updatedAgendaItem},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {id: agendaItemId, content, pinned, sortOrder} = updatedAgendaItem
  const agendaItem = await dataLoader.get('agendaItems').load(agendaItemId)
  const teamId = agendaItem!.teamId

  // VALIDATION
  if (content && content.length > 64) {
    return {error: {message: 'Agenda item must be shorter'}}
  }

  // RESOLUTION
  await pg
    .updateTable('AgendaItem')
    .set({
      pinned: pinned ?? undefined,
      content: content ?? undefined,
      sortOrder: sortOrder ?? undefined
    })
    .where('id', '=', agendaItemId)
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
    await pg
      .updateTable('NewMeeting')
      .set({phases: JSON.stringify(phases)})
      .where('id', '=', meetingId)
      .execute()
  }
  const data = {agendaItemId, meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateAgendaItemPayload', data, subOptions)
  return data
}

export default updateAgendaItem
