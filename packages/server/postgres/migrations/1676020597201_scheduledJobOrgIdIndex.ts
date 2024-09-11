import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export const up = async function () {
  await connectRethinkDB()
  try {
    await r.table('ScheduledJob').indexCreate('orgId').run()
  } catch {}
  await r.getPoolMaster()?.drain()
}

export const down = async function () {
  await connectRethinkDB()
  await r.table('ScheduledJob').indexDrop('orgId').run()
  await r.getPoolMaster()?.drain()
}
