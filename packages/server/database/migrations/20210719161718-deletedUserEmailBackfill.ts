import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('User')
    .filter({isRemoved: true})
    .update((user) => ({
      email: r.expr('DELETED:').add(user('id').add(':1626360264029'))
    }))
    .run()
}

export const down = async function (r: R) {
  await r
    .table('User')
    .filter({isRemoved: true})
    .update({
      email: 'DELETED'
    })
    .run()
}
