import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    const updatedSaml = await r
      .table('SAML')
      .map((row) => {
        return {
          id: row('domain'),
          domain: row('domain'),
          url: row('url'),
          metadata: row('metadata')
        }
      })
      .run()

    await r
      .table('SAML')
      .insert(updatedSaml, {conflict: 'replace'})
      .run()

    await r
      .table('SAML')
      .filter((row) => row('id').ne(row('domain')))
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    const updatedSaml = await r
      .table('SAML')
      .map((row) => {
        return {
          domain: row('domain'),
          url: row('url'),
          metadata: row('metadata')
        }
      })
      .run()

    await r
      .table('SAML')
      .insert(updatedSaml)
      .run()
  } catch (e) {
    console.log(e)
  }
}
