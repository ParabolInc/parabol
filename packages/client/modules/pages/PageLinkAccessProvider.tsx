import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {PageLinkAccessProvider_page$key} from '../../__generated__/PageLinkAccessProvider_page.graphql'
import {PageLinkAccessContext} from './PageLinkAccessContext'

interface Props {
  pageRef: PageLinkAccessProvider_page$key
  children: ReactNode
}

export const PageLinkAccessProvider = (props: Props) => {
  const {pageRef, children} = props
  const page = useFragment(
    graphql`
      fragment PageLinkAccessProvider_page on Page {
        linkedPages {
          __typename
          id
        }
      }
    `,
    pageRef
  )
  const {linkedPages} = page
  const canOpenByPageCode = useMemo(
    () =>
      new Map(
        linkedPages.map(({__typename, id}) => [Number(id.split(':')[1]), __typename === 'Page'])
      ),
    [linkedPages]
  )
  return (
    <PageLinkAccessContext.Provider value={canOpenByPageCode}>
      {children}
    </PageLinkAccessContext.Provider>
  )
}
