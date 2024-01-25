import getRethink from '../database/rethinkDriver'
import getKysely from '../postgres/getKysely'

async function setup() {
  const r = await getRethink()
  const pg = getKysely()
  // The IP address is always localhost
  // so the safety checks will eventually fail if run too much

  await Promise.all([
    r.table('FailedAuthRequest').delete().run(),
    r.table('PasswordResetRequest').delete().run(),
    pg.deleteFrom('SAMLDomain').where('domain', '=', 'example.com').execute()
  ])
}

export default setup
