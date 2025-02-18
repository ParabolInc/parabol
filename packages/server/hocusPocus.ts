import {Database} from '@hocuspocus/extension-database'
import {Redis} from '@hocuspocus/extension-redis'
import {Throttle} from '@hocuspocus/extension-throttle'
import {Server} from '@hocuspocus/server'
import getKysely from './postgres/getKysely'
import {isAuthenticated} from './utils/authorization'
import {feistelCipher} from './utils/feistelCipher'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {Logger} from './utils/Logger'
import RedisInstance from './utils/RedisInstance'

const {SERVER_ID, HOCUS_POCUS_PORT} = process.env
const server = Server.configure({
  port: Number(HOCUS_POCUS_PORT),
  quiet: true,
  async onListen(data) {
    Logger.log(`\n🔥🔥🔥 Server ID: ${SERVER_ID}. Ready for Hocus Pocus: Port ${data.port} 🔥🔥🔥`)
  },
  async onAuthenticate(data) {
    const {documentName, requestParameters} = data
    const authTokenStr = requestParameters.get('token')
    const authToken = getVerifiedAuthToken(authTokenStr)
    if (!isAuthenticated(authToken)) {
      throw new Error('Unauthenticated')
    }
    const [_entityName, entityId] = documentName.split(':')
    const dbId = feistelCipher.decrypt(Number(entityId))
    // TODO implement RBAC to see if authToken.sub has permission to access entityId
    const page = await getKysely()
      .selectFrom('Page')
      .where('id', '=', dbId)
      .select('userId')
      .executeTakeFirst()
    if (!page) throw new Error('Document does not exist')
    if (page.userId !== authToken.sub) throw new Error('Unauthorized')
  },
  extensions: [
    new Database({
      // Return a Promise to retrieve data …
      fetch: async ({documentName}) => {
        const [_entityName, entityId] = documentName.split(':')
        const dbId = feistelCipher.decrypt(Number(entityId))
        const pg = getKysely()
        const res = await pg
          .selectFrom('Page')
          .select('yDoc')
          .where('id', '=', dbId)
          .executeTakeFirst()
        console.log('fetched', res)
        return res?.yDoc ?? null
      },
      // … and a Promise to store data:
      store: async ({documentName, state}) => {
        const [_entityName, entityId] = documentName.split(':')
        const dbId = feistelCipher.decrypt(Number(entityId))
        const pg = getKysely()
        await pg.updateTable('Page').set({yDoc: state}).where('id', '=', dbId).execute()
      }
    }),
    new Redis({
      redis: new RedisInstance('hocusPocus')
    }),
    new Throttle({
      throttle: 15,
      banTime: 5
    })
  ]
})

server.listen()
