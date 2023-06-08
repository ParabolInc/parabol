import {r, RValue} from 'rethinkdb-ts'
import {ParabolR} from '../../database/rethinkDriver'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
  return r as any as ParabolR
}

export async function up() {
  await connectRethinkDB()
  await r
    .table('MeetingSettings')
    .filter({meetingType: 'retrospective'})
    .update((row: RValue) => ({
      phaseTypes: r.branch(
        row('phaseTypes').contains('TEAM_HEALTH'),
        row('phaseTypes'),
        row('phaseTypes').contains('checkin'),
        row('phaseTypes').insertAt(1, 'TEAM_HEALTH'),
        row('phaseTypes').prepend('TEAM_HEALTH')
      )
    }))
    .run()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  await connectRethinkDB()
  await r
    .table('MeetingSettings')
    .filter({meetingType: 'retrospective'})
    .update((row: RValue) => ({
      phaseTypes: row('phaseTypes').difference(['TEAM_HEALTH'])
    }))
    .run()
  await r.getPoolMaster()?.drain()
}
