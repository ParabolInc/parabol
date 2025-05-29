import {Database} from '@hocuspocus/extension-database'
import {Redis} from '@hocuspocus/extension-redis'
import {Throttle} from '@hocuspocus/extension-throttle'
import {Server} from '@hocuspocus/server'
import {TiptapTransformer} from '@hocuspocus/transformer'
import {generateText, type JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from '../client/shared/tiptap/serverTipTapExtensions'
import getKysely from './postgres/getKysely'
import {isAuthenticated} from './utils/authorization'
import {feistelCipher} from './utils/feistelCipher'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {Logger} from './utils/Logger'
import RedisInstance from './utils/RedisInstance'

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

    const [_entityName, entityId] = documentName.split(':')
    const dbId = feistelCipher.decrypt(Number(entityId))
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
        const [_entityName, entityId] = documentName.split(':')
        const dbId = feistelCipher.decrypt(Number(entityId))
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
        // TODO: there may be a way to sniff out the change from the yjs state so we don't have to parse the whole doc
        // Transforming the whole doc is actually faster than yjs traversal + generateText(generateJSON()). 2ms vs 10ms
        const doc = TiptapTransformer.fromYdoc(document).default as JSONContent
        const docText = generateText(doc, serverTipTapExtensions)
        const delimiter = '\n\n'
        const titleBreakIdx = docText.indexOf(delimiter)
        const safeTitleBreakIdx = titleBreakIdx === -1 ? docText.length : titleBreakIdx
        const title = docText.slice(0, safeTitleBreakIdx).slice(0, 255)
        const plaintextContent = docText.slice(safeTitleBreakIdx + delimiter.length)
        const [_entityName, entityId] = documentName.split(':')
        const dbId = feistelCipher.decrypt(Number(entityId))
        const pg = getKysely()
        await pg
          .updateTable('Page')
          .set({yDoc: state, title, plaintextContent})
          .where('id', '=', dbId)
          .execute()
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
