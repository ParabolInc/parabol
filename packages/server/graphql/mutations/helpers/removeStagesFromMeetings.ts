import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import getNextFacilitatorStageAfterStageRemoved from './getNextFacilitatorStageAfterStageRemoved'

/*
 * NewMeetings have a predefined set of stages, we need to remove it manually
 */

const removeStagesFromMeetings = async (
  filterFn: (stage: any) => boolean,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const r = await getRethink()
  const [activeMeetings, completedMeetings] = await Promise.all([
    dataLoader.get('activeMeetingsByTeamId').load(teamId),
    dataLoader.get('completedMeetingsByTeamId').load(teamId)
  ])
  const meetings = activeMeetings.concat(completedMeetings)

  await Promise.all(
    meetings.map((meeting) => {
      const {id: meetingId, phases} = meeting
      phases.forEach((phase) => {
        // do this inside the loop since it's mutative
        const {stages} = phase
        for (let i = stages.length - 1; i >= 0; i--) {
          const stage = stages[i]!
          if (filterFn(stage)) {
            const nextStage = getNextFacilitatorStageAfterStageRemoved(
              meeting.facilitatorStageId,
              stage.id,
              phases
            )
            if (nextStage.id !== meeting.facilitatorStageId) {
              // mutative
              meeting.facilitatorStageId = nextStage.id
              nextStage.startAt = now
              nextStage.viewCount = nextStage.viewCount ? nextStage.viewCount + 1 : 1
              nextStage.isNavigable = true
            }
            const stageIdx = stages.indexOf(stage)
            stages.splice(stageIdx, 1)
          }
        }
      })
      return r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          facilitatorStageId: meeting.facilitatorStageId,
          phases,
          updatedAt: now
        })
        .run()
    })
  )
  return meetings.map((meeting) => meeting.id)
}

export default removeStagesFromMeetings
