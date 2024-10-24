import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'

async function teardown() {
  await getKysely().destroy()
  console.log('global teardown destroy')
  await getRedis().quit()
}

export default teardown
