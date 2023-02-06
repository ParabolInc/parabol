import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r
    .table('SAML')
    .update((row) => ({
      orgId: row('orgId').default(null)
    }))
    .run()

  await r.table('SAML').indexCreate('orgId').run()
}

export const down = async function (r: R) {
  await r.table('SAML').indexDrop('orgId').run()
}
