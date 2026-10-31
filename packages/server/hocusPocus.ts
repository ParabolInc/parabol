import {Database} from '@hocuspocus/extension-database'
import {Throttle} from '@hocuspocus/extension-throttle'
import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import tracer from 'dd-trace'
import {pack, unpack} from 'msgpackr'
import {Doc, encodeStateAsUpdate} from 'yjs'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import {publishToEmbedder} from './graphql/mutations/helpers/publishToEmbedder'
import getKysely from './postgres/getKysely'
import {getAuthTokenFromCookie} from './utils/authCookie'
import {CipherId} from './utils/CipherId'
import getRedis from './utils/getRedis'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {Logger} from './utils/Logger'
import logError from './utils/logError'
import {publishPageNotification} from './utils/publishPageNotification'
import {afterLoadDocument, afterUnloadDocument} from './utils/tiptap/afterLoadDocument'
import {authenticateYjsConnection, type YjsContext} from './utils/tiptap/authenticateYjsConnection'
import * as hocusPocusCustomEvents from './utils/tiptap/hocusPocusCustomEvents'
import {updateAllBacklinkedPageLinkTitles} from './utils/tiptap/hocusPocusHub'
import {RedisPublisher} from './utils/tiptap/hocusPocusRedisPublisher'
import {RedisServerAffinity, type SerializedHTTPRequest} from './utils/tiptap/RedisServerAffinity'
import {SafeHocuspocus} from './utils/tiptap/SafeHocuspocus'
import {sanitizeAwarenessStates} from './utils/tiptap/sanitizeAwarenessStates'
import {updatePageContent} from './utils/tiptap/updatePageContent'

const SERVER_ID = process.env.SERVER_ID!

const pushGQLTitleUpdates = async (pageId: number) => {
  // This is necessary for titles of top-level items (shared, team, private) to propagate in real time
  const dataLoader = getNewDataLoader('pushGQLTitleUpdates')
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId: undefined}
  const data = {pageId}
  await publishPageNotification(pageId, 'UpdatePagePayload', data, subOptions, dataLoader)
  dataLoader.dispose()
}

// Verify the JWT once per socket (and once per proxied socket on the doc owner)
// instead of once per document in onConnect/onAuthenticate
const deriveContext = (serializedHTTPRequest: SerializedHTTPRequest): YjsContext => {
  const {headers, url, connectedAt} = serializedHTTPRequest
  const cookieToken = getAuthTokenFromCookie(headers['cookie'] as string)
  const queryToken = new URL(url, 'http://localhost').searchParams.get('token')
  const token = cookieToken || queryToken
  const authToken = getVerifiedAuthToken(token)
  // OAuth, PAT and SCIM tokens carry narrower grants than a session
  const sessionToken = authToken?.aud === 'action' ? authToken : null
  // Unauthenticated users are allowed for public pages, but a bad token is rejected in onAuthenticate
  return {
    userId: sessionToken?.sub,
    iat: sessionToken?.iat,
    exp: sessionToken?.exp,
    jti: sessionToken?.jti,
    connectedAt,
    isUnauthenticated: !!token && !sessionToken
  }
}

export const redisHocusPocus = new RedisServerAffinity({
  pack,
  redis: getRedis(),
  serverId: SERVER_ID,
  unpack,
  customEvents: hocusPocusCustomEvents,
  deriveContext
})

export const hocuspocus = new SafeHocuspocus<YjsContext>({
  quiet: true,
  // A tab authenticates every doc on its socket at once when it reconnects; the default of 100 closes it and it loops.
  // Each pending doc queues ~2 messages, so maxUnauthenticatedQueueMessages (1000) bounds this near 500 anyway
  maxPendingDocuments: 500,
  onAuthenticate: authenticateYjsConnection,
  async beforeHandleAwareness({documentName, context, states}) {
    sanitizeAwarenessStates(documentName, context?.userId, states)
  },
  afterLoadDocument,
  afterUnloadDocument,
  extensions: [
    new Database({
      // Return a Promise to retrieve data …
      fetch: async ({documentName}) => {
        const [dbId, , entity] = CipherId.fromClient(documentName)
        if (entity === 'meeting') {
          return Buffer.from(encodeStateAsUpdate(new Doc()))
        }
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
        // Must not throw: hocuspocus v4's debouncer leaks `runningExecutions` on error,
        // causing isCurrentlyExecuting() to return true forever and preventing document unload.
        try {
          const [dbId, , entity] = CipherId.fromClient(documentName)
          if (entity === 'meeting') return
          // TODO: don't transform the document into content. just traverse the yjs doc for speed
          let content: JSONContent | null = null
          try {
            content = TiptapTransformer.fromYdoc(document, 'default') as JSONContent
          } catch (e) {
            // a document too deep to convert must still be saved
            logError(e instanceof Error ? e : new Error(String(e)), {tags: {documentName}})
          }
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
              updateAllBacklinkedPageLinkTitles({pageId: dbId, title: updatedTitle})
            ])
          }
          const firstConnection = document.getConnections()[0]
          const userId = firstConnection?.context.userId as string | undefined
          publishToEmbedder({jobType: 'embedPage:start', pageId: dbId, userId}).catch(Logger.log)
        } catch (e) {
          logError(e instanceof Error ? e : new Error(String(e)), {tags: {documentName}})
        }
      }
    }),
    redisHocusPocus,
    new Throttle({
      throttle: 100,
      banTime: 1
    }),
    new RedisPublisher()
  ]
})
