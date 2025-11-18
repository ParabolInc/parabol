import Redis from 'ioredis'
import type {Kysely} from 'kysely'
import {pack} from 'msgpackr'
import {applyUpdate, Doc, encodeStateAsUpdate, XmlElement} from 'yjs'
import type {PartialPath} from '../../fileStorage/FileStoreManager'
import {getFileStoreManager} from '../../fileStorage/getFileStoreManager'
import {CipherId} from '../../utils/CipherId'
import {getRedisOptions} from '../../utils/getRedisOptions'

const getBaseUrl = () => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  if (cdnType === 'local') {
    return `/self-hosted`
  } else {
    const CDN_BASE_URL = process.env.CDN_BASE_URL!
    const baseUrl = new URL(CDN_BASE_URL.replace(/^\/+/, 'https://'))
    baseUrl.pathname += '/store'
    return baseUrl.toString()
  }
}
export async function up(db: Kysely<any>): Promise<void> {
  // we can't guarantee that a webserver is running because that's not always true in all PPMIs
  // but, it is true in the SaaS
  // So, we need to lock the document just in case, and then we can edit the yDoc directly.
  // if we can't achieve the lock, then the doc must be opened on a webserver
  // in that case, we need to either close it remotely, or have it execute an event that is defined below
  // the better UX of the 2 is to execute a function below
  //

  const pages = await db
    .selectFrom('Page')
    .select(['id', 'yDoc'])
    .where('summaryMeetingId', 'is', null)
    .where('deletedAt', 'is', null)
    .execute()
  if (pages.length === 0) return
  const redis = new Redis(process.env.REDIS_URL!, {
    ...getRedisOptions(),
    connectionName: '2025-11-17T19:13:58.950Z_replace-pic-urls'
  })
  const SERVER_ID = process.env.SERVER_ID!
  const prefix = getBaseUrl()
  const fileMoves = [] as {from: PartialPath; to: PartialPath}[]
  await Promise.all(
    pages.map(async ({id: pageId, yDoc}) => {
      const pageCode = CipherId.encrypt(pageId)
      const documentName = `page:${pageCode}`
      if (!yDoc) return
      const doc = new Doc()
      applyUpdate(doc, yDoc)
      const frag = doc.getXmlFragment('default')
      const walker = frag.createTreeWalker((yxml) => {
        if (!(yxml instanceof XmlElement) || yxml.nodeName !== 'imageBlock') return false
        return true
      })
      let changed = false
      for (const node of walker) {
        const imageBlock = node as XmlElement
        const src = imageBlock.getAttribute('src')
        if (src?.startsWith(prefix)) {
          changed = true
          const decodedSrc = decodeURI(src)
          const parts = decodedSrc.split('/')
          const oldPartialPath = parts.slice(-4).join('/') as PartialPath
          const newPartialPath = oldPartialPath.replace(
            /User\/(.+)\/assets/,
            `Page/${pageCode}/assets`
          ) as PartialPath
          fileMoves.push({from: oldPartialPath, to: newPartialPath})
          const nextSrc = decodedSrc
            .replace(prefix, '/assets')
            .replace(/User\/(.+)\/assets/, `Page/${pageCode}/assets`)
          imageBlock.setAttribute('src', nextSrc)
          console.log(`Updated Image URL in ${pageId} from ${oldPartialPath} to ${newPartialPath}`)
        }
      }
      if (!changed) return
      const proxyTo = await redis.set(
        `rsaLock:${documentName}`,
        SERVER_ID,
        'PX',
        10_000,
        'NX',
        'GET'
      )
      if (!proxyTo) {
        await db
          .updateTable('Page')
          .set({yDoc: Buffer.from(encodeStateAsUpdate(doc))})
          .where('id', '=', pageId)
          .execute()
      } else {
        // if the document is already open, we must send the update to that worker
        const update = encodeStateAsUpdate(doc, yDoc)
        const proxyMessage = pack({
          eventName: 'applyYjsUpdate',
          documentName,
          payload: {update},
          replyTo: `null`,
          replyId: 0,
          type: 'customEventStart'
        })
        await redis.publish(`rsaMsg:${proxyTo}`, proxyMessage)
      }
      // there are a couple race conditions here, since the migration is locking the doc, but not accepting messages for it
      await redis.del(`rsaLock:${documentName}`)
    })
  )
  if (fileMoves.length === 0) return
  const fileManager = getFileStoreManager()
  await Promise.all(
    fileMoves.map(async ({from, to}) => {
      return fileManager.moveFile(from, to)
    })
  )
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(_db: Kysely<any>): Promise<void> {
  // noop
}
