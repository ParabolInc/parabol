import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  await r.table('ScheduledJob').indexCreate('orgId').run()
}

export const down = async function (r: R) {
  await r.table('ScheduledJob').indexDrop('orgId').run()
}
