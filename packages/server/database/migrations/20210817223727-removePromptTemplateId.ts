import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .update((row) => ({
        phases: row('phases').without('promptTemplateId')
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .update((meeting) => ({
        phases: meeting('phases').map((phase) =>
          phase('phaseType')
            .eq('reflect')
            .branch(phase.merge({promptTemplateId: meeting('templateId')}), phase)
        )
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
}
