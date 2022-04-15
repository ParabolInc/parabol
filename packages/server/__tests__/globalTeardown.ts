import getRethink from '../database/rethinkDriver'

async function teardown() {
  const r = await getRethink()
  return r.getPoolMaster()?.drain()
}

export default teardown
