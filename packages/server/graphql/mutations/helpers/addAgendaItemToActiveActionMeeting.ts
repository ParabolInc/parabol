import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import {DataLoaderWorker} from '../../graphql'

/*
 * NewMeetings have a predefined set of stages, we need to add the new agenda item manually
 */
const addAgendaItemToActiveActionMeeting = async (
  agendaItemId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const actionMeeting = activeMeetings.find(
    (activeMeeting) => activeMeeting.meetingType === 'action'
  )
  if (!actionMeeting) return undefined
  const {id: meetingId, phases} = actionMeeting
  const agendaItemPhase = getPhase(phases, 'agendaitems')
  if (!agendaItemPhase) return undefined

  // If any of the stages are navigable, then the new one should be as well. Same goes if there are no stages yet, i.e. we're in first call
  const isNewAgendaItemStageNavigable =
    agendaItemPhase.stages.length === 0 ||
    agendaItemPhase.stages.some((stage) => stage.isNavigableByFacilitator || stage.isNavigable)
  const {stages} = agendaItemPhase
  const newStage = new AgendaItemsStage({
    agendaItemId,
    isNavigableByFacilitator: isNewAgendaItemStageNavigable,
    isNavigable: isNewAgendaItemStageNavigable
  })
  const {discussionId} = newStage
  stages.push(newStage)

  await getKysely()
    .with('UpdatePhases', (qb) =>
      qb
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
    )
    .with('InsertDiscussion', (qb) =>
      qb.insertInto('Discussion').values({
        id: discussionId,
        teamId,
        meetingId,
        discussionTopicType: 'agendaItem',
        discussionTopicId: agendaItemId
      })
    )
    .updateTable('AgendaItem')
    .set({meetingId})
    .where('id', '=', agendaItemId)
    .execute()

  return meetingId
}

export default addAgendaItemToActiveActionMeeting
