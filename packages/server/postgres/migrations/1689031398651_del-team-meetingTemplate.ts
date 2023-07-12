import {r} from 'rethinkdb-ts'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up() {
  await connectRethinkDB()
  try {
    // 20220329101759-dropTeams never ran in prod, deleting the Team table here
    await Promise.allSettled([
      r.tableDrop('Team').run(),
      r.tableDrop('MeetingTemplate').run(),
      r.tableDrop('GQLRequest').run(),
      r.tableDrop('DuplicateEmails').run(),
      r.tableDrop('SecureDomain').run()
    ])
  } catch {
    // noop
  }
  await r.getPoolMaster()?.drain()
}

export async function down() {
  // can't undo a drop
}
