import getRethink from '../database/rethinkDriver'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'

async function teardown() {
  const r = await getRethink()
  await r.getPoolMaster()?.drain()
  await getKysely().destroy()
  await getRedis().quit()
}

export default teardown
