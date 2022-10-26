import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('MeetingSettings')
    .update((row) => ({accessiblePremiumTemplateId: row('selectedTemplateId').default(null)}))
    .run()
}

export const down = async function (r: R) {
  await r
    .table('MeetingSettings')
    .replace((row) => row.without('accessiblePremiumTemplateId'))
    .run()
}
