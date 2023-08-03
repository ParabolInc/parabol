import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  r.table('Organization').filter(r.row('tier').eq('personal')).update({tier: 'starter'}).run()
}

export const down = async function (r: R) {
  // noop
}
