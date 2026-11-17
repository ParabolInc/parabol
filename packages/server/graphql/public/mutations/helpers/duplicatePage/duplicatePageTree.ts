import {GraphQLError} from 'graphql'
import type AuthToken from '../../../../../database/types/AuthToken'
import {selectPages} from '../../../../../postgres/select'
import type {DataLoaderWorker} from '../../../../graphql'
import type {ResourceGrants} from '../../../ResourceGrants'
import {announcePageCopies} from './announcePageCopies'
import {buildPageCopies} from './buildPageCopies'
import type {DuplicatePlacement} from './getDuplicatePlacement'
import {insertPageCopies} from './insertPageCopies'
import {linkCopyIntoParent} from './linkCopyIntoParent'
import {readPageStates} from './readPageStates'
import {rehostPageAssets} from './rehostPageAssets'
import {reservePageIds} from './reservePageIds'
import {selectPagesToCopy} from './selectPagesToCopy'

export const MAX_DUPLICATE_PAGES = 500

interface Params {
  viewerId: string
  authToken: AuthToken
  dataLoader: DataLoaderWorker
  resourceGrants: ResourceGrants | null | undefined
  sourcePageId: number
  placement: DuplicatePlacement
  mutatorId?: string
  maxPages?: number
}

export const duplicatePageTree = async (params: Params) => {
  const {viewerId, authToken, dataLoader, resourceGrants, sourcePageId, placement, mutatorId} =
    params
  const maxPages = params.maxPages ?? MAX_DUPLICATE_PAGES
  const pages = await selectPagesToCopy({
    sourcePageId,
    viewerId,
    resourceGrants,
    limit: maxPages + 1
  })
  if (pages.length === 0) {
    throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (pages.length > maxPages) {
    throw new GraphQLError(
      `This page has more than ${maxPages} pages inside it. Copy a smaller part of it.`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }

  const [states, copyIds] = await Promise.all([
    readPageStates(pages.map(({id}) => id)),
    reservePageIds(pages.length)
  ])
  const copyIdBySourceId = new Map(pages.map(({id}, idx) => [id, copyIds[idx]!]))
  const hostedSrcs = await rehostPageAssets({states, copyIdBySourceId, authToken, dataLoader})
  const copies = buildPageCopies({
    pages,
    states,
    copyIdBySourceId,
    hostedSrcs,
    rootParent: placement.kind === 'parent' ? placement.parent : null
  })

  await insertPageCopies({copies, placement, viewerId})

  const [rootCopy] = copies
  await linkCopyIntoParent(placement, rootCopy!)
  const rootCopyPage = await selectPages().where('id', '=', rootCopy!.id).executeTakeFirstOrThrow()
  await announcePageCopies({rootCopy: rootCopyPage, copies, viewerId, mutatorId})
  return rootCopyPage
}
