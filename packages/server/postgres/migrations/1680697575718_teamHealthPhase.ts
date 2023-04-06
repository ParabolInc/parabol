import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  // Noop, using the feature will however create data which is not backwards compatible, thus only a down migration
}

export async function down() {
  await connectRethinkDB()
  // There are cleaner ways, but this is just for dev and it works
  await r
    .table('NewMeeting')
    .filter({meetingType: 'retrospective'})
    .filter(r.row('phases').contains((row) => row('phaseType').eq('TEAM_HEALTH')))
    .update({
      phases: r.row('phases').difference(r.row('phases').filter({phaseType: 'TEAM_HEALTH'}))
    })
  await r
    .table('MeetingSettings')
    .filter({meetingType: 'retrospective'})
    .filter(r.row('phaseTypes').contains('TEAM_HEALTH'))
    .update({phaseTypes: r.row('phaseTypes').difference(['TEAM_HEALTH'])})
  await r.getPoolMaster()?.drain()
}
