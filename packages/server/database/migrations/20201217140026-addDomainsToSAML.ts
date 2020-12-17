import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  const samlWithDomains = await r
    .table('SAML')
    .map((row) => {
      return {
        id: row('id'),
        domains: [row('id').add(r.branch(row('id').eq('allegro'), '.pl', '.com'))],
        url: row('url'),
        metadata: row('metadata')
      }
    })
    .run()

  await r.table('SAML').insert(samlWithDomains, {conflict: 'replace'}).run()

  await r.table('SAML').indexCreate('domains', {multi: true}).run()

  await r.table('SAML').indexDrop('domain').run()
}

export const down = async function (r: R) {
  await r.table('SAML').indexDrop('domains').run()

  await r
    .table('SAML')
    .replace((row) => row.without('domains'))
    .run()
}
