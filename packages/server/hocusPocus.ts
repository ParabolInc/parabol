import {Database} from '@hocuspocus/extension-database'
import {Throttle} from '@hocuspocus/extension-throttle'
import {Server} from '@hocuspocus/server'
import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import tracer from 'dd-trace'
import {encodeStateAsUpdate} from 'yjs'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import getKysely from './postgres/getKysely'
import {CipherId} from './utils/CipherId'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {Logger} from './utils/Logger'
import {publishPageNotification} from './utils/publishPageNotification'
import RedisInstance from './utils/RedisInstance'
import {afterLoadDocument} from './utils/tiptap/afterLoadDocument'
import {withBacklinks} from './utils/tiptap/hocusPocusHub'
import {Redis} from './utils/tiptap/hocusPocusRedis'
import {RedisPublisher} from './utils/tiptap/hocusPocusRedisPublisher'
import {updatePageContent} from './utils/tiptap/updatePageContent'
import {updateYDocNodes} from './utils/tiptap/updateYDocNodes'

const {SERVER_ID, HOCUS_POCUS_PORT} = process.env
const port = Number(HOCUS_POCUS_PORT)
if (isNaN(port) || port < 0 || port > 65536) {
  throw new Error('Invalid Env Var: HOCUS_POCUS_PORT must be >= 0 and < 65536')
}

const pushGQLTitleUpdates = async (pageId: number) => {
  // This is necessary for titles of top-level items (shared, team, private) to propagate in real time
  const dataLoader = getNewDataLoader()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId: undefined}
  const data = {pageId}
  await publishPageNotification(pageId, 'UpdatePagePayload', data, subOptions, dataLoader)
  dataLoader.dispose()
}
export const server = new Server({
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
    const req = data.request as any
    // put the userId on the request because context isn't available until onAuthenticate
    req.userId = authToken?.sub
  },
  async onAuthenticate(data) {
    const {documentName, request, connectionConfig} = data
    const userId = (request as any).userId as string
    const [dbId] = CipherId.fromClient(documentName)
    let pageAccess = await getKysely()
      .selectFrom('PageAccess')
      .select('role')
      .where('pageId', '=', dbId)
      .where('userId', '=', userId)
      .executeTakeFirst()
    if (!pageAccess) {
      pageAccess = await getKysely()
        .selectFrom('PageExternalAccess')
        .select('role')
        .where('pageId', '=', dbId)
        .where('email', '=', '*')
        .limit(1)
        .executeTakeFirst()
      if (!pageAccess) {
        throw new Error(`Document does not exist or user is not authorized: ${dbId}`)
      }
    }
    const {role} = pageAccess
    if (role === 'viewer' || role === 'commenter') {
      connectionConfig.readOnly = true
    }
    return {userId}
  },
  afterLoadDocument,
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
        if (res?.yDoc) return res.yDoc
        // Return a page with a heading by default so we can insert child page links at position 1
        // Without a heading at pos 0, position 1 is out of range
        const yDoc = TiptapTransformer.toYdoc(
          {
            type: 'doc',
            content: [{type: 'heading', attrs: {level: 1}, content: []}]
          },
          undefined,
          [StarterKit]
        )
        return Buffer.from(encodeStateAsUpdate(yDoc))
      },
      store: async ({documentName, state, document}) => {
        const [dbId, pageCode] = CipherId.fromClient(documentName)
        // TODO: don't transform the document into content. just traverse the yjs doc for speed
        const content = TiptapTransformer.fromYdoc(document, 'default') as JSONContent
        const {updatedTitle} = await tracer.trace(
          'hocusPocus.updatePageContent',
          {
            tags: {documentName}
          },
          () => updatePageContent(dbId, content, state)
        )
        if (updatedTitle) {
          await Promise.all([
            tracer.trace('hocusPocus.pushGQLTitleUpdates', {tags: {documentName}}, () =>
              pushGQLTitleUpdates(dbId)
            ),
            tracer.trace('hocusPocus.withBacklinks', {tags: {documentName}}, () =>
              withBacklinks(dbId, (doc) => {
                tracer.trace('hocusPocus.updateYDocNodes', {tags: {documentName}}, () =>
                  updateYDocNodes(doc, 'pageLinkBlock', {pageCode}, (node) => {
                    node.setAttribute('title', updatedTitle)
                  })
                )
              })
            )
          ])
        }
      }
    }),
    new Redis({
      redis: new RedisInstance('hocusPocus'),
      lockTimeout: 2000
    }),
    new Throttle({
      throttle: 100,
      banTime: 1
    }),
    new RedisPublisher()
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
