import {sql} from 'kysely'
import '../../../scripts/webpack/utils/dotenv'
import getKysely from '../postgres/getKysely'

async function setup() {
  // The IP address is always localhost
  // so the safety checks will eventually fail if run too much
  const pg = getKysely()
  await sql`
    TRUNCATE TABLE "PasswordResetRequest";
    ALTER TABLE "NewMeeting" DISABLE TRIGGER "check_meeting_overlap";
  `.execute(pg)
}

export default setup
