import {R} from 'rethinkdb-ts'

const premiumTemplateIds = [
  'startStopContinueTemplate',
  'gladSadMadTemplate',
  'whatWentWellTemplate',
  'workingStuckTemplate',
  'sailboatTemplate',
  'original4Template',
  'fourLsTemplate'
]

export const up = async function (r: R) {
  await r
    .table('MeetingTemplate')
    .getAll(r.args(premiumTemplateIds))
    .update({isPremium: true})
    .run()
}
export const down = async function (r: R) {
  await r
    .table('MeetingTemplate')
    .getAll(r.args(premiumTemplateIds))
    .update({isPremium: false})
    .run()
}
