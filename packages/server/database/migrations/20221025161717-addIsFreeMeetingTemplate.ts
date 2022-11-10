import {R} from 'rethinkdb-ts'

const freeTemplateIds = [
  'startStopContinueTemplate',
  'gladSadMadTemplate',
  'whatWentWellTemplate',
  'workingStuckTemplate',
  'sailboatTemplate',
  'original4Template',
  'fourLsTemplate'
]

export const up = async function (r: R) {
  await r.table('MeetingTemplate').getAll(r.args(freeTemplateIds)).update({isFree: true}).run()
}
export const down = async function (r: R) {
  await r
    .table('MeetingTemplate')
    .getAll(r.args(freeTemplateIds))
    .replace((row) => row.without('isFree'))
    .run()
}
