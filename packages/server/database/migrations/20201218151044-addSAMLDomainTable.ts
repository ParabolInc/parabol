import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  await r.tableCreate('SAMLDomain', {primaryKey: 'nameVerified'}).run()

  const samlDomains = await r
    .table('SAML')
    .map((row) => {
      return {
        nameVerified: [row('id').add('.com'), true],
        samlId: row('id'),
        name: row('id').add('.com')
      }
    })
    .run()

  await r.table('SAMLDomain').insert(samlDomains, {conflict: 'replace'}).run()

  await r.table('SAMLDomain').indexCreate('samlId').run()
  await r.table('SAMLDomain').indexCreate('name').run()

  await r.table('SAML').indexDrop('domain').run()

  await r
    .table('SAML')
    .replace((row) => row.without('domain'))
    .run()
}

export const down = async function (r: R) {
  await r.tableDrop('SAMLDomain').run()
}
