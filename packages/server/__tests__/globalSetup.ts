import '../../../scripts/webpack/utils/dotenv'
import getRethink from '../database/rethinkDriver'

async function setup() {
  const r = await getRethink()
  // The IP address is always localhost
  // so the safety checks will eventually fail if run too much
  await Promise.all([
    r.table('FailedAuthRequest').delete().run(),
    r.table('PasswordResetRequest').delete().run()
  ])
}

export default setup
