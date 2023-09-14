import getRethink from '../../../database/rethinkDriver'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import MeetingAction from '../../../database/types/MeetingAction'
import insertDiscussions from '../../../postgres/queries/insertDiscussions'
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
  const now = new Date()
  const r = await getRethink()
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const actionMeeting = activeMeetings.find(
    (activeMeeting) => activeMeeting.meetingType === 'action'
  ) as MeetingAction | undefined
  if (!actionMeeting) return undefined
  const {id: meetingId, phases} = actionMeeting
  const agendaItemPhase = getPhase(phases, 'agendaitems')
  if (!agendaItemPhase) return undefined

  const {stages} = agendaItemPhase
  const newStage = new AgendaItemsStage({
    agendaItemId,
    isNavigableByFacilitator: true,
    isNavigable: true
  })
  const {discussionId} = newStage
  stages.push(newStage)

  await Promise.all([
    r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      })
      .run(),
    r.table('AgendaItem').get(agendaItemId).update({meetingId: meetingId}).run(),
    insertDiscussions([
      {
        id: discussionId,
        teamId,
        meetingId,
        discussionTopicType: 'agendaItem' as const,
        discussionTopicId: agendaItemId
      }
    ])
  ])

  return meetingId
}

export default addAgendaItemToActiveActionMeeting
