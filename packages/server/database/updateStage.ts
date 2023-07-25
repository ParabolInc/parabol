import getRethink from './rethinkDriver'
import rMapIf from './rMapIf'
import {NewMeetingPhaseTypeEnum} from './types/GenericMeetingPhase'

// this is a uesful function for updating a stage inside a meeting object
// it is superior to mutating the `phases` object in JS and then pushing the whole object
// because it eliminates the chance of a race

const updateStage = async (
  meetingId: string,
  stageId: string,
  phaseType: NewMeetingPhaseTypeEnum,
  updater: (stage: any) => any
) => {
  const r = await getRethink()
  const mapIf = rMapIf(r)
  return r
    .table('NewMeeting')
    .get(meetingId)
    .update((meeting: any) => ({
      phases: mapIf(
        meeting('phases'),
        (phase: any) => phase('phaseType').eq(phaseType),
        (phase: any) =>
          phase.merge({
            stages: mapIf(phase('stages'), (stage: any) => stage('id').eq(stageId), updater)
          })
      )
    }))
    .run()
}

export default updateStage
