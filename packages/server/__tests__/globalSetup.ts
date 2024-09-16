import {sql} from 'kysely'
import '../../../scripts/webpack/utils/dotenv'
import getKysely from '../postgres/getKysely'

async function setup() {
  // The IP address is always localhost
  // so the safety checks will eventually fail if run too much
  await sql`TRUNCATE TABLE "PasswordResetRequest"`.execute(getKysely())
}

export default setup
