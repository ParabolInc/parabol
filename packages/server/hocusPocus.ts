import type {IncomingMessage} from 'node:http'
import {Database} from '@hocuspocus/extension-database'
import {Throttle} from '@hocuspocus/extension-throttle'
import {Document, Hocuspocus, onStoreDocumentPayload} from '@hocuspocus/server'
import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import tracer from 'dd-trace'
import ms from 'ms'
import {pack, unpack} from 'msgpackr'
import {Doc, encodeStateAsUpdate} from 'yjs'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import getKysely from './postgres/getKysely'
import type {Pageroleenum} from './postgres/types/pg'
import {getAuthTokenFromCookie} from './utils/authCookie'
import {CipherId} from './utils/CipherId'
import getRedis from './utils/getRedis'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import logError from './utils/logError'
import {publishPageNotification} from './utils/publishPageNotification'
import {afterLoadDocument} from './utils/tiptap/afterLoadDocument'
import * as hocusPocusCustomEvents from './utils/tiptap/hocusPocusCustomEvents'
import {updateAllBacklinkedPageLinkTitles} from './utils/tiptap/hocusPocusHub'
import {RedisPublisher} from './utils/tiptap/hocusPocusRedisPublisher'
import {RedisServerAffinity} from './utils/tiptap/RedisServerAffinity'
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

type Req = IncomingMessage & {userId?: string; tms: string[]}

const getMeetingTeamId = async (meetingId: string) => {
  // This is a top 15 query in terms of total time because of call frequency, so caching is necessary
  const redis = getRedis()
  const key = `meetingTeamId:${meetingId}`
  const cachedTeamId = await redis.get(key)
  if (cachedTeamId) return cachedTeamId
  const meeting = await getKysely()
    .selectFrom('NewMeeting')
    .select('teamId')
    .where('id', '=', meetingId)
    .executeTakeFirst()
  if (!meeting) return null
  const {teamId} = meeting
  redis.set(key, teamId, 'PX', ms('3h')).catch(() => {})
  return teamId
}
export const redisHocusPocus = new RedisServerAffinity({
  pack,
  redis: getRedis(),
  serverId: SERVER_ID,
  unpack,
  customEvents: hocusPocusCustomEvents
})
export const hocuspocus = new Hocuspocus({
  quiet: true,
  async onConnect(data) {
    const request = data.request as Req
    // handle authentication once onConnect vs. on every onAuthenticate
    const cookieToken = await getAuthTokenFromCookie(request.headers['cookie'])
    const queryToken = new URL(request.url!, 'http://localhost').searchParams.get('token')
    const token = cookieToken || queryToken
    const authToken = getVerifiedAuthToken(token)
    const userId = authToken?.sub
    if (token && !userId) {
      const err = new Error('Unauthenticated')
      ;(err as any).reason = 'Unauthenticated'
      throw err
    }
    // Unauthenticated users are allowed for public pages
    // put the userId on the request because context isn't available until onAuthenticate
    request.userId = authToken?.sub
    request.tms = authToken?.tms ?? []
  },

  async onAuthenticate(data) {
    const {documentName, request, connectionConfig} = data
    const userId = (request as Req).userId
    if (documentName.startsWith('meeting:')) {
      const tms = (request as Req).tms
      const [, meetingId] = documentName.split(':')
      if (!meetingId) throw new Error(`Invalid meetingId: ${meetingId}`)
      if (!userId) throw new Error(`Meeting awareness requires a userId`)
      const meetingTeamId = await getMeetingTeamId(meetingId)
      if (!tms.includes(meetingTeamId ?? '')) {
        // They may have a stale token or client is making a request it shouldn't.
        // Unsure how to reproduce, but I see errors in DD logs.
        const teamMember = await getKysely()
          .selectFrom('TeamMember')
          .select('id')
          .where('teamId', '=', meetingTeamId)
          .where('userId', '=', userId)
          .where('isNotRemoved', '=', true)
          .executeTakeFirst()
        if (!teamMember) {
          const error = new Error(
            `Meeting awareness requires being on the team: ${userId} ${meetingTeamId}`
          )
          ;(error as any).reason = 'Unauthorized'
          throw error
        }
      }
      return {userId}
    }
    const [dbId] = CipherId.fromClient(documentName)
    if (dbId === 0) {
      const error = new Error(`Invalid document request from client: ${documentName}`)
      logError(error, {userId, tags: {dbId, documentName}})
      throw error
    }
    let pageAccess: {role: Pageroleenum} | undefined
    if (userId) {
      pageAccess = await getKysely()
        .selectFrom('PageAccess')
        .select('role')
        .where('pageId', '=', dbId)
        .where('userId', '=', userId)
        .executeTakeFirst()
    }
    if (!pageAccess) {
      pageAccess = await getKysely()
        .selectFrom('PageExternalAccess')
        .select('role')
        .where('pageId', '=', dbId)
        .where('email', '=', '*')
        .limit(1)
        .executeTakeFirst()
      if (!pageAccess) {
        const error = new Error(
          `Document does not exist or user is not authorized: ${documentName}`
        )
        logError(error, {userId, extras: {dbId}})
        throw error
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
        const [dbId, , entity] = CipherId.fromClient(documentName)
        if (entity === 'meeting') return
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
            updateAllBacklinkedPageLinkTitles({pageId: dbId, title: updatedTitle})
          ])
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

// patch hocuspocus to not crash on store errors
hocuspocus.storeDocumentHooks = (
  document: Document,
  hookPayload: onStoreDocumentPayload,
  immediately?: boolean
) => {
  const self = hocuspocus
  return self.debouncer.debounce(
    `onStoreDocument-${document.name}`,
    () => {
      return self
        .hooks('onStoreDocument', hookPayload)
        .then(() => {
          self.hooks('afterStoreDocument', hookPayload).then(async () => {
            // Remove document from memory.

            if (document.getConnectionsCount() > 0) {
              return
            }

            await self.unloadDocument(document)
          })
        })
        .catch((error) => {
          logError(error, {tags: {documentName: document.name}})
          // TODO report error to client so it can retry saving

          if (document.getConnectionsCount() > 0) {
            return
          }

          self.unloadDocument(document)
        })
    },
    immediately ? 0 : self.configuration.debounce,
    self.configuration.maxDebounce
  )
}
