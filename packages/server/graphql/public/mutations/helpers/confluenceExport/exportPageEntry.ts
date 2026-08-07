import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {applyUpdate, Doc} from 'yjs'
import appOrigin from '../../../../../appOrigin'
import getKysely from '../../../../../postgres/getKysely'
import {CipherId} from '../../../../../utils/CipherId'
import {
  ConfluenceApiError,
  type ConfluenceServerManager
} from '../../../../../utils/ConfluenceServerManager'
import {convertDatabasePageToStorage} from '../../../../../utils/confluence/convertDatabasePageToStorage'
import {convertTipTapToConfluenceStorage} from '../../../../../utils/confluence/convertTipTapToConfluenceStorage'
import type {
  DegradedItem,
  PageExportPageState,
  StorageConversionResult
} from '../../../../../utils/confluence/types'
import {Logger} from '../../../../../utils/Logger'
import {fetchAssetBuffer} from './fetchAssetBuffer'

const MAX_BODY_BYTES = 4_500_000 // soft cap under Confluence's 5 MB request limit
const SIZE_ERROR_COPY = 'Too large for Confluence (5 MB limit). Try splitting this page.'

const ERROR_COPY: Record<string, string> = {
  tooLarge: SIZE_ERROR_COPY,
  forbidden: "You can't create pages in this space",
  rateLimit: 'Confluence is rate-limiting exports. Retry in a few minutes.'
}

export type PageEntryExportResult =
  | {
      status: 'success'
      confluencePageId: string
      targetUrl: string | undefined
      finalTitle: string
      degraded: DegradedItem[]
      attachmentCount: number
    }
  | {status: 'error'; error: string; errorClass: PageExportPageState['errorClass']}

/**
 * Converts one Parabol page and creates it in Confluence, uploading its assets as
 * attachments. Failed attachment uploads degrade the file — the page stays successful.
 */
export const exportPageEntry = async (input: {
  entry: PageExportPageState
  pagesJson: PageExportPageState[]
  parentConfluenceId: string | undefined
  confluence: ConfluenceServerManager
  spaceId: string
  siteUrl: string | undefined
  userId: string
  pageExportId: string
}): Promise<PageEntryExportResult> => {
  const {entry, pagesJson, parentConfluenceId, confluence, spaceId, siteUrl, userId, pageExportId} =
    input
  const pg = getKysely()
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
        return {
          status: 'error',
          error: 'This page is still generating. Try again when the summary finishes.',
          errorClass: 'unknown'
        }
      }
      conversion = convertTipTapToConfluenceStorage(tipTapDoc, {
        parabolPageUrl,
        appOrigin,
        resolvePageLink: (linkPageCode) => {
          const childDbId = CipherId.decrypt(linkPageCode)
          const childEntry = pagesJson.find(({pageId}) => pageId === childDbId)
          if (childEntry && childEntry.status !== 'skipped' && childEntry.status !== 'error') {
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
      return {status: 'error', error: SIZE_ERROR_COPY, errorClass: 'tooLarge'}
    }

    const {page: created, finalTitle} = await confluence.createPageWithUniqueTitle({
      spaceId,
      parentId: parentConfluenceId,
      title: conversion.title || 'Untitled',
      storageValue: conversion.xhtml
    })

    const degraded: DegradedItem[] = conversion.degraded.map((item) => ({
      ...item,
      pageId: entry.pageId
    }))
    let attachmentCount = 0
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

    return {
      status: 'success',
      confluencePageId: created.id,
      targetUrl: siteUrl ? `${siteUrl}/wiki${created.webui}` : undefined,
      finalTitle,
      degraded,
      attachmentCount
    }
  } catch (e) {
    if (e instanceof ConfluenceApiError) {
      Logger.error(
        `confluenceExport ${pageExportId} page ${entry.pageId}: ${e.status} ${e.errorClass} ${e.message}`
      )
      return {
        status: 'error',
        error: ERROR_COPY[e.errorClass] ?? e.message,
        errorClass: e.errorClass
      }
    }
    Logger.error(e)
    return {
      status: 'error',
      error: e instanceof Error ? e.message : 'Export failed',
      errorClass: 'unknown'
    }
  }
}
