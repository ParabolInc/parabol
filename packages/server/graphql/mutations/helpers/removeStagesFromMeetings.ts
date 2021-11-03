import getRethink from '../../../database/rethinkDriver'
import getNextFacilitatorStageAfterStageRemoved from './getNextFacilitatorStageAfterStageRemoved'
import {DataLoaderWorker} from '../../graphql'

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
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const completedMeetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
  const meetings = activeMeetings.concat(completedMeetings)

  await Promise.all(
    meetings.map((meeting) => {
      const {id: meetingId, phases} = meeting
      phases.forEach((phase) => {
        // do this inside the loop since it's mutative
        let {facilitatorStageId} = meeting
        const {stages} = phase
        for (let i = stages.length - 1; i >= 0; i--) {
          const stage = stages[i]
          if (filterFn(stage)) {
            const nextStage = getNextFacilitatorStageAfterStageRemoved(
              facilitatorStageId,
              stage.id,
              phases
            )
            if (nextStage.id !== facilitatorStageId) {
              // mutative
              meeting.facilitatorStageId = nextStage.id
              nextStage.startAt = now
              nextStage.viewCount = nextStage.viewCount ? nextStage.viewCount + 1 : 1
              nextStage.isNavigable = true
              facilitatorStageId = nextStage.id
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
