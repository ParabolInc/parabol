import getRethink from '../../../database/rethinkDriver'
import Meeting from '../../../database/types/Meeting'
import getNextFacilitatorStageAfterStageRemoved from './getNextFacilitatorStageAfterStageRemoved'
import {DataLoaderWorker} from '../../graphql'

/*
 * NewMeetings have a predefined set of stages, we need to remove it manually
 */

const removeStagesFromNewMeeting = async (
  filterFn: (stage: any) => boolean,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const r = await getRethink()
  const team = await dataLoader.get('teams').load(teamId)
  const {meetingId} = team
  if (meetingId) {
    // make sure it's a new meeting
    const newMeeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()) as Meeting | null
    if (!newMeeting) return undefined
    const {phases} = newMeeting
    phases.forEach((phase) => {
      // do this inside the loop since it's mutative
      const {facilitatorStageId} = newMeeting
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
            newMeeting.facilitatorStageId = nextStage.id
            nextStage.startAt = now
            nextStage.viewCount = nextStage.viewCount ? nextStage.viewCount + 1 : 1
          }
          const stageIdx = stages.indexOf(stage)
          stages.splice(stageIdx, 1)
        }
      }
    })
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        facilitatorStageId: newMeeting.facilitatorStageId,
        phases,
        updatedAt: now
      })
      .run()
    return meetingId
  }
  return undefined
}

export default removeStagesFromNewMeeting
