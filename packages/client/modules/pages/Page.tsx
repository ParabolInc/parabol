import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {Page_page$key} from '../../__generated__/Page_page.graphql'
import type {Page_viewer$key} from '../../__generated__/Page_viewer.graphql'
import {useIsAuthenticated} from '../../components/IsAuthenticatedProvider'
import {usePageProvider} from '../../hooks/usePageProvider'
import {DatabaseEditor} from './DatabaseEditor'
import {PageEditor} from './PageEditor'
import {PageHeader} from './PageHeader'
import {PageHeaderPublic} from './PageHeaderPublic'

interface Props {
  viewerRef: Page_viewer$key | null
  pageRef: Page_page$key
  isPublic?: boolean
}

export const Page = (props: Props) => {
  const {viewerRef, pageRef, isPublic} = props
  const viewer =
    useFragment(
      graphql`
      fragment Page_viewer on User {
        id
        ...useTipTapPageEditor_viewer
        ...useTipTapDatabaseEditor_viewer
      }
    `,
      viewerRef
    ) ?? null
  const page = useFragment(
    graphql`
      fragment Page_page on Page {
        ...PageHeader_page
        id
        ancestorIds
        access {
          viewer
          public
        }
        isDatabase
      }
    `,
    pageRef
  )

  const {id: pageId, access, isDatabase} = page
  const {viewer: viewerAccess, public: publicAccess} = access
  const {provider, synced} = usePageProvider(pageId)
  const isLoggedIn = useIsAuthenticated()
  const isViewerEditable = ['owner', 'editor'].includes(viewerAccess || '')
  const isPublicEditable = ['owner', 'editor'].includes(publicAccess || '') && !isLoggedIn
  const isEditable = isViewerEditable || isPublicEditable
  // The editor is conditionally loaded only after syncing so the forced schema is not injected before
  // The yjs document loads
  return (
    <div className='relative flex w-full flex-col items-center bg-white'>
      {isPublic ? <PageHeaderPublic /> : <PageHeader pageRef={page} />}
      <div className='relative flex min-h-screen w-full max-w-[960px] justify-center bg-white pt-28 pb-10'>
        {synced &&
          (isDatabase ? (
            <DatabaseEditor viewerRef={viewer} isEditable={isEditable} provider={provider} />
          ) : (
            <PageEditor
              viewerRef={viewer}
              isEditable={isEditable}
              provider={provider}
              pageId={pageId}
            />
          ))}
      </div>
    </div>
  )
}

export default Page
