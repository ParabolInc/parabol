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
import useAtmosphere from './useAtmosphere'

const fragment = getFragment(graphql`
  fragment usePageViewerAccess_page on Page {
    __typename
    access {
      viewer
    }
  }
`)
// PageEntryQuery loads the open page's linked pages, so it owns their records
const owner = createOperationDescriptor(pageEntryQuery, {pageId: ''}).request
const getSelector = (pageCode: number) =>
  createReaderSelector(fragment, `page:${pageCode}`, {}, owner)

// The viewer's role on a page: null when they cannot open it, undefined when their access isn't loaded.
// Relay never changes a stored record's __typename, so access.viewer wins over a stale PagePreview
export const lookupPageViewerAccess = (environment: IEnvironment, pageCode: number) => {
  const data = environment.lookup(getSelector(pageCode)).data as
    | usePageViewerAccess_page$data
    | null
    | undefined
  if (!data) return undefined
  if (data.access) return data.access.viewer
  return (data.__typename as string) === 'PagePreview' ? null : undefined
}

export const subscribeToPageViewerAccess = (
  environment: IEnvironment,
  pageCode: number,
  onChange: () => void
) => {
  const disposable = environment.subscribe(environment.lookup(getSelector(pageCode)), onChange)
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
