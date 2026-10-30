import graphql from 'babel-plugin-relay/macro'
import {useCallback, useSyncExternalStore} from 'react'
import {
  createOperationDescriptor,
  createReaderSelector,
  getFragment,
  type IEnvironment
} from 'relay-runtime'
import pageEntryQuery from '../__generated__/PageEntryQuery.graphql'
import type {usePageViewerAccess_page$data} from '../__generated__/usePageViewerAccess_page.graphql'
import {hasMinPageRole} from '../shared/hasMinPageRole'
import useAtmosphere from './useAtmosphere'

const pageFragment = getFragment(graphql`
  fragment usePageViewerAccess_page on Page {
    access {
      viewer
      public
    }
  }
`)
// PageEntryQuery loads the open page's linked pages, so it owns their records
const owner = createOperationDescriptor(pageEntryQuery, {pageId: ''}).request
const getPageSelector = (pageCode: number) =>
  createReaderSelector(pageFragment, `page:${pageCode}`, {}, owner)

type PageAccess = NonNullable<usePageViewerAccess_page$data['access']>
const getStrongestRole = ({viewer, public: publicRole}: PageAccess) => {
  if (viewer && publicRole) return hasMinPageRole(publicRole, viewer) ? viewer : publicRole
  if (viewer || publicRole) return viewer || publicRole
  return viewer === null && publicRole === null ? null : undefined
}

// The viewer's strongest role on a page: null when they cannot open it, undefined when it isn't loaded
export const lookupPageViewerAccess = (environment: IEnvironment, pageCode: number) => {
  const page = environment.lookup(getPageSelector(pageCode)).data as
    | usePageViewerAccess_page$data
    | null
    | undefined
  return page?.access ? getStrongestRole(page.access) : undefined
}

export const subscribeToPageViewerAccess = (
  environment: IEnvironment,
  pageCode: number,
  onChange: () => void
) => {
  const disposable = environment.subscribe(environment.lookup(getPageSelector(pageCode)), onChange)
  return () => disposable.dispose()
}

export const usePageViewerAccess = (pageCode: number) => {
  const atmosphere = useAtmosphere()
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToPageViewerAccess(atmosphere, pageCode, onChange),
    [atmosphere, pageCode]
  )
  return useSyncExternalStore(subscribe, () => lookupPageViewerAccess(atmosphere, pageCode))
}
