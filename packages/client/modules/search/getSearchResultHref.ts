import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {getSearchResultHref_page$key} from '../../__generated__/getSearchResultHref_page.graphql'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {getSyncedBlockHash} from '../../tiptap/syncedBlockHash'
import {GQLID} from '../../utils/GQLID'

const getPagePath = (id: string, title: string | null | undefined) => {
  const [pageCode] = GQLID.fromKey(id)
  return {pageCode: Number(pageCode), path: `/pages/${getPageSlug(Number(pageCode), title)}`}
}

export const getSearchResultHref = (pageRef: getSearchResultHref_page$key) => {
  const page = readInlineData(
    graphql`
      fragment getSearchResultHref_page on Page @inline {
        id
        title
        isSyncedBlock
        syncedBlockPlacements {
          pages {
            isOriginal
            page {
              id
              title
              isSyncedBlock
              deletedAt
            }
          }
        }
      }
    `,
    pageRef
  )
  const {id, title, isSyncedBlock, syncedBlockPlacements} = page
  const own = getPagePath(id, title)
  if (!isSyncedBlock) return own.path
  const hosts = (syncedBlockPlacements?.pages ?? []).filter(
    (placement) => !placement.page.deletedAt && !placement.page.isSyncedBlock
  )
  const target = hosts.find((placement) => placement.isOriginal) ?? hosts[0]
  if (!target) return own.path
  return `${getPagePath(target.page.id, target.page.title).path}${getSyncedBlockHash(own.pageCode)}`
}
