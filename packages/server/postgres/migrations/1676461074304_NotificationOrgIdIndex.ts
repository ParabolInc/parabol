import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export const up = async function () {
  await connectRethinkDB()
  await r.table('Notification').indexCreate('orgId').run()
  await r.getPoolMaster()?.drain()
}

export const down = async function () {
  await connectRethinkDB()
  await r.table('Notification').indexDrop('orgId').run()
  await r.getPoolMaster()?.drain()
}
