import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {applyUpdate, Doc} from 'yjs'
import appOrigin from '../../../../../appOrigin'
import generateUID from '../../../../../generateUID'
import getKysely from '../../../../../postgres/getKysely'
import {selectPageExports} from '../../../../../postgres/select'
import AtlassianServerManager from '../../../../../utils/AtlassianServerManager'
import {analytics} from '../../../../../utils/analytics/analytics'
import {CipherId} from '../../../../../utils/CipherId'
import {
  ConfluenceApiError,
  ConfluenceServerManager
} from '../../../../../utils/ConfluenceServerManager'
import {convertDatabasePageToStorage} from '../../../../../utils/confluence/convertDatabasePageToStorage'
import {convertTipTapToConfluenceStorage} from '../../../../../utils/confluence/convertTipTapToConfluenceStorage'
import type {DegradedItem, StorageConversionResult} from '../../../../../utils/confluence/types'
import {hasConfluenceScopes} from '../../../../../utils/hasConfluenceScopes'
import {Logger} from '../../../../../utils/Logger'
import publish from '../../../../../utils/publish'
import RedisLockQueue from '../../../../../utils/RedisLockQueue'
import type {DataLoaderWorker} from '../../../../graphql'
import publishNotification from '../publishNotification'
import {fetchAssetBuffer} from './fetchAssetBuffer'

const MAX_BODY_BYTES = 4_500_000 // soft cap under Confluence's 5 MB request limit
const SIZE_ERROR_COPY = 'Too large for Confluence (5 MB limit). Try splitting this page.'

const ERROR_COPY: Record<string, string> = {
  tooLarge: SIZE_ERROR_COPY,
  forbidden: "You can't create pages in this space",
  rateLimit: 'Confluence is rate-limiting exports. Retry in a few minutes.'
}

/**
 * The detached export job. Processes every pagesJson entry with status 'pending' in tree
 * order (parents first). The initial run seeds all entries pending; retry re-seeds a failed
 * subtree — both use this same code path. One export runs at a time globally to protect the
 * shared Atlassian OAuth rate pool.
 */
export const runConfluenceExport = async (pageExportId: string, dataLoader: DataLoaderWorker) => {
  // the ttl is the max HOLD time before the lock self-releases — it must exceed the
  // worst-case job duration (100 pages × create/upload with 429 retries) or a second
  // export starts running concurrently mid-job
  const redisLock = new RedisLockQueue('confluenceExport', 1_800_000)
  await redisLock.lock(600_000)
  const startedAt = Date.now()
  const pg = getKysely()
  // subscribers resolve published payloads with the dataloader registered under this
  // operationId — publishing without it leaves them a null dataLoader and crashes resolvers
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  try {
    const exportRow = await selectPageExports()
      .where('id', '=', pageExportId)
      .executeTakeFirstOrThrow()
    const {userId, cloudId, spaceId, parentPageId: rootParentId} = exportRow
    const pagesJson = exportRow.pagesJson
    const degraded: DegradedItem[] = [...exportRow.degradedJson]
    let attachmentCount = 0

    const persistAndPublish = async () => {
      await pg
        .updateTable('PageExport')
        .set({pagesJson: JSON.stringify(pagesJson), updatedAt: sql`CURRENT_TIMESTAMP`})
        .where('id', '=', pageExportId)
        .execute()
      dataLoader.get('pageExports').clear(pageExportId)
      publish(
        SubscriptionChannel.NOTIFICATION,
        userId,
        'PageExportProgressPayload',
        {pageExportId},
        subOptions
      )
    }

    const failAllPending = async (error: string) => {
      pagesJson.forEach((entry) => {
        if (entry.status === 'pending') {
          entry.status = 'error'
          entry.error = error
          entry.errorClass = 'unknown'
        }
      })
      await persistAndPublish()
    }

    const auths = await dataLoader.get('atlassianAuthsByUserId').load(userId)
    // only an auth whose account was granted THIS site — no silent fallback to another site's token
    const authRow = auths.find(
      ({scope, cloudIds}) => hasConfluenceScopes(scope) && cloudIds.includes(cloudId)
    )
    const freshAuth = authRow
      ? await dataLoader.get('freshAtlassianAuth').load({teamId: authRow.teamId, userId})
      : null
    if (!freshAuth) {
      await failAllPending('No Atlassian connection for this Confluence site')
    } else {
      const atlassianManager = new AtlassianServerManager(freshAuth.accessToken)
      const sites = await atlassianManager.getAccessibleResources()
      const siteUrl = Array.isArray(sites) ? sites.find(({id}) => id === cloudId)?.url : undefined
      const confluence = new ConfluenceServerManager(freshAuth.accessToken, cloudId)

      const confluenceIdByPageId = new Map<number, string>()
      pagesJson.forEach(({pageId, confluencePageId}) => {
        if (confluencePageId) confluenceIdByPageId.set(pageId, confluencePageId)
      })

      for (const entry of pagesJson) {
        if (entry.status !== 'pending') continue
        const parentEntry =
          entry.parentPageId == null
            ? null
            : pagesJson.find(({pageId}) => pageId === entry.parentPageId)
        if (parentEntry && parentEntry.status !== 'success') {
          entry.status = 'skipped'
          entry.error = 'skipped (parent failed)'
          await persistAndPublish()
          continue
        }
        entry.status = 'exporting'
        await persistAndPublish()
        try {
          const page = await pg
            .selectFrom('Page')
            .select(['id', 'title', 'yDoc', 'isDatabase'])
            .where('id', '=', entry.pageId)
            .executeTakeFirstOrThrow()
          const pageCode = CipherId.encrypt(page.id)
          const parabolPageUrl = makeAppURL(appOrigin, `pages/${pageCode}`)
          const ydoc = new Doc()
          if (page.yDoc) applyUpdate(ydoc, page.yDoc)

          let conversion: StorageConversionResult
          if (page.isDatabase) {
            conversion = convertDatabasePageToStorage(ydoc, {
              parabolPageUrl,
              appOrigin,
              snapshotDate: new Date().toDateString(),
              pageTitle: page.title || 'Untitled'
            })
          } else {
            const tipTapDoc = TiptapTransformer.fromYdoc(ydoc, 'default') as JSONContent
            if (tipTapDoc.content?.some(({type}) => type === 'thinkingBlock')) {
              entry.status = 'error'
              entry.error = 'This page is still generating. Try again when the summary finishes.'
              entry.errorClass = 'unknown'
              await persistAndPublish()
              continue
            }
            conversion = convertTipTapToConfluenceStorage(tipTapDoc, {
              parabolPageUrl,
              appOrigin,
              resolvePageLink: (linkPageCode) => {
                const childDbId = CipherId.decrypt(linkPageCode)
                const childEntry = pagesJson.find(({pageId}) => pageId === childDbId)
                if (
                  childEntry &&
                  childEntry.status !== 'skipped' &&
                  childEntry.status !== 'error'
                ) {
                  // child is (or will be) a real Confluence page in this space
                  return {
                    href: makeAppURL(appOrigin, `pages/${linkPageCode}`),
                    confluenceTitle: childEntry.title
                  }
                }
                return {href: makeAppURL(appOrigin, `pages/${linkPageCode}`)}
              }
            })
          }

          if (Buffer.byteLength(conversion.xhtml, 'utf8') > MAX_BODY_BYTES) {
            entry.status = 'error'
            entry.error = SIZE_ERROR_COPY
            entry.errorClass = 'tooLarge'
            await persistAndPublish()
            continue
          }

          const parentConfluenceId =
            entry.parentPageId == null
              ? (rootParentId ?? undefined)
              : confluenceIdByPageId.get(entry.parentPageId)
          const {page: created, finalTitle} = await confluence.createPageWithUniqueTitle({
            spaceId,
            parentId: parentConfluenceId,
            title: conversion.title || 'Untitled',
            storageValue: conversion.xhtml
          })
          for (const asset of conversion.assets) {
            const assetData = await fetchAssetBuffer(asset.srcUrl, userId)
            if (!assetData) {
              degraded.push({
                pageId: entry.pageId,
                blockType: 'asset',
                count: 1,
                treatment: 'file could not be copied'
              })
              continue
            }
            try {
              await confluence.uploadAttachment(
                created.id,
                asset.filename,
                assetData.buffer,
                assetData.mimeType
              )
              attachmentCount++
            } catch (e) {
              // the page exists — a failed upload degrades that file, it doesn't fail the page
              degraded.push({
                pageId: entry.pageId,
                blockType: 'asset',
                count: 1,
                treatment: 'file could not be attached'
              })
              Logger.error(
                `confluenceExport ${pageExportId} attachment ${asset.filename}: ${e instanceof ConfluenceApiError ? `${e.status} ${e.message}` : e}`
              )
            }
          }
          confluenceIdByPageId.set(entry.pageId, created.id)
          entry.confluencePageId = created.id
          entry.targetUrl = siteUrl ? `${siteUrl}/wiki${created.webui}` : undefined
          entry.title = finalTitle
          entry.status = 'success'
          degraded.push(...conversion.degraded.map((item) => ({...item, pageId: entry.pageId})))
          await persistAndPublish()
        } catch (e) {
          entry.status = 'error'
          if (e instanceof ConfluenceApiError) {
            entry.errorClass = e.errorClass
            entry.error = ERROR_COPY[e.errorClass] ?? e.message
            Logger.error(
              `confluenceExport ${pageExportId} page ${entry.pageId}: ${e.status} ${e.errorClass} ${e.message}`
            )
          } else {
            entry.errorClass = 'unknown'
            entry.error = e instanceof Error ? e.message : 'Export failed'
            Logger.error(e)
          }
          await persistAndPublish()
        }
      }
    }

    const statuses = pagesJson.map(({status}) => status)
    const status = statuses.every((s) => s === 'success')
      ? 'success'
      : statuses.some((s) => s === 'success')
        ? 'partial'
        : 'failed'
    const rootEntry = pagesJson[0]
    await pg
      .updateTable('PageExport')
      .set({
        status,
        degradedJson: JSON.stringify(degraded),
        rootTargetPageId: rootEntry?.confluencePageId ?? null,
        rootTargetUrl: rootEntry?.targetUrl ?? null,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where('id', '=', pageExportId)
      .execute()
    dataLoader.get('pageExports').clear(pageExportId)

    const notification = {
      id: generateUID(),
      type: 'PAGE_EXPORT_COMPLETE' as const,
      userId,
      pageExportId
    }
    await pg.insertInto('Notification').values(notification).execute()
    publishNotification(notification, subOptions)

    const viewer = await dataLoader.get('users').loadNonNull(userId)
    const properties = {
      pageExportId,
      pageCount: pagesJson.length,
      successCount: statuses.filter((s) => s === 'success').length,
      attachmentCount,
      durationMs: Date.now() - startedAt,
      status,
      degradedCensus: degraded.map(({blockType, count}) => `${blockType}:${count}`).join(',')
    }
    if (status === 'failed') {
      analytics.confluenceExportFailed(viewer, properties)
    } else {
      analytics.confluenceExportCompleted(viewer, properties)
    }
  } finally {
    await redisLock.unlock()
  }
}
