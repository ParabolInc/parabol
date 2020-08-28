import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    await r
      .table('SAML')
      .update((row) => ({
        id: row('domain')
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('SAML')
      .filter((row) => row('id').ne(row('domain')))
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function() {
  // noop
}
