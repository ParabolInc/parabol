import {Database} from '@hocuspocus/extension-database'
import {Redis} from '@hocuspocus/extension-redis'
import {Throttle} from '@hocuspocus/extension-throttle'
import {Server} from '@hocuspocus/server'
import {TiptapTransformer} from '@hocuspocus/transformer'
import {type JSONContent} from '@tiptap/core'
import getKysely from './postgres/getKysely'
import {updateBacklinks} from './updateBacklinks'
import {isAuthenticated} from './utils/authorization'
import {CipherId} from './utils/CipherId'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {Logger} from './utils/Logger'
import RedisInstance from './utils/RedisInstance'
import {updatePageContent} from './utils/tiptap/updatePageContent'
import {updateTitleInBacklinks} from './utils/tiptap/updateTitleInBacklinks'

const {SERVER_ID, HOCUS_POCUS_PORT} = process.env
const port = Number(HOCUS_POCUS_PORT)
if (isNaN(port) || port < 0 || port > 65536) {
  throw new Error('Invalid Env Var: HOCUS_POCUS_PORT must be >= 0 and < 65536')
}
const server = Server.configure({
  stopOnSignals: false,
  port,
  quiet: true,
  async onListen(data) {
    Logger.log(`\n🔮🔮🔮 Server ID: ${SERVER_ID}. Ready for Hocus Pocus: Port ${data.port} 🔮🔮🔮`)
  },
  async onUpgrade(data) {
    const {request} = data
    const authTokenStr = new URL(request.url!, 'http://localhost').searchParams.get('token')
    const authToken = getVerifiedAuthToken(authTokenStr)
    if (!isAuthenticated(authToken)) {
      throw new Error('Unauthenticated')
    }
  },
  async onAuthenticate(data) {
    const {documentName, requestParameters, connection} = data
    const authTokenStr = requestParameters.get('token')
    const authToken = getVerifiedAuthToken(authTokenStr)
    const [dbId] = CipherId.fromClient(documentName)
    const pageAccess = await getKysely()
      .selectFrom('PageAccess')
      .select('role')
      .where('pageId', '=', dbId)
      .where('userId', '=', authToken.sub)
      .executeTakeFirst()
    if (!pageAccess) throw new Error('Document does not exist or user is not authorized')
    const {role} = pageAccess
    if (role === 'viewer' || role === 'commenter') {
      connection.readOnly = true
    }
  },
  extensions: [
    new Database({
      // Return a Promise to retrieve data …
      fetch: async ({documentName}) => {
        const [dbId] = CipherId.fromClient(documentName)
        const pg = getKysely()
        const res = await pg
          .selectFrom('Page')
          .select('yDoc')
          .where('id', '=', dbId)
          .executeTakeFirst()
        return res?.yDoc ?? null
      },
      // … and a Promise to store data:
      store: async ({documentName, state, document}) => {
        const [dbId, clientId] = CipherId.fromClient(documentName)
        // TODO: there may be a way to sniff out the change from the yjs state so we don't have to parse the whole doc
        // Transforming the whole doc is actually faster than yjs traversal + generateText(generateJSON()). 2ms vs 10ms
        const content = TiptapTransformer.fromYdoc(document, 'default') as JSONContent
        const [{updatedTitle}] = await Promise.all([
          updatePageContent(dbId, content, state),
          updateBacklinks(dbId, document, content)
        ])
        if (updatedTitle) {
          await updateTitleInBacklinks(dbId, clientId, updatedTitle, server)
        }
      }
    }),
    new Redis({
      redis: new RedisInstance('hocusPocus')
    }),
    new Throttle({
      throttle: 100,
      banTime: 1
    })
  ]
})

server.listen()

const signalHandler = async () => {
  await server.destroy()
  process.exit(0)
}

process.on('SIGINT', signalHandler)
process.on('SIGQUIT', signalHandler)
process.on('SIGTERM', async () => {
  // DO NOT CALL process.exit(0), let the handler in server.js handle that
  await server.destroy()
})
