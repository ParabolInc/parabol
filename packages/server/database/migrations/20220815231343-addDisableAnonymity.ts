import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('MeetingSettings')
    .filter((row) => row.hasFields('disableAnonymity').not())
    .update({disableAnonymity: false})
    .run()
}

export const down = async function (r: R) {
  await r
    .table('MeetingSettings')
    .replace((row) => row.without('disableAnonymity'))
    .run()
}
