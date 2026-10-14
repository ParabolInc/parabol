import graphql from 'babel-plugin-relay/macro'
import {useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {Page_page$key} from '../../__generated__/Page_page.graphql'
import type {Page_viewer$key} from '../../__generated__/Page_viewer.graphql'
import type {PageComments_page$key} from '../../__generated__/PageComments_page.graphql'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import {useHasMinWidth} from '../../hooks/useHasMinWidth'
import {usePageProvider} from '../../hooks/usePageProvider'
import {hasMinPageRole} from '../../shared/hasMinPageRole'
import {cn} from '../../ui/cn'
import {PageComments} from './comments/PageComments'
import {DatabaseEditor} from './DatabaseEditor'
import {PageEditor} from './PageEditor'
import {PageHeader} from './PageHeader'
import {PageHeaderPublic} from './PageHeaderPublic'
import {useIsPageStreaming} from './useEditablePage'

const MIN_WIDTH_FOR_THREAD_RAIL = 1000

interface Props {
  viewerRef: Page_viewer$key | null
  pageRef: Page_page$key
  commentsRef: PageComments_page$key
  isPublic?: boolean
}

export const Page = (props: Props) => {
  const {viewerRef, pageRef, commentsRef, isPublic} = props
  const viewer =
    useFragment(
      graphql`
      fragment Page_viewer on User {
        id
        organizations {
          hasConfluenceExport: featureFlag(featureName: "ConfluenceExport")
          hasPageComments: featureFlag(featureName: "PageComments")
        }
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
        title
        ancestorIds
        isDatabase
        access {
          viewer
        }
      }
    `,
    pageRef
  )

  const {id: pageId, isDatabase, title, access} = page
  const showConfluenceExport = !!viewer?.organizations.some((org) => org.hasConfluenceExport)
  const hasPageComments = !!viewer?.organizations.some((org) => org.hasPageComments)
  const canComment = hasPageComments && hasMinPageRole('commenter', access.viewer)
  const documentTitle = title || 'Untitled'
  useDocumentTitle(`${documentTitle} | Parabol`, documentTitle)
  const {provider, synced} = usePageProvider(pageId)
  const isPageGenerating = useIsPageStreaming(provider)
  const pageElementRef = useRef<HTMLDivElement>(null)
  const canFitThreadRail = useHasMinWidth(pageElementRef, MIN_WIDTH_FOR_THREAD_RAIL)
  const [commentsSlot, setCommentsSlot] = useState<HTMLDivElement | null>(null)
  // The editor is conditionally loaded only after syncing so the forced schema is not injected before
  // The yjs document loads
  return (
    <div ref={pageElementRef} className='relative flex flex-col items-center bg-surface-document'>
      {isPublic ? (
        <PageHeaderPublic />
      ) : (
        <PageHeader
          pageRef={page}
          showConfluenceExport={showConfluenceExport}
          isPageGenerating={isPageGenerating}
          commentsSlotRef={setCommentsSlot}
        />
      )}
      <div
        className={cn(
          'relative flex min-h-screen w-full justify-center bg-surface-document pt-28 pb-10 has-data-page-thread-rail:mr-74 print:mr-0 print:pt-0 print:caret-transparent',
          isDatabase ? 'max-w-9/10' : 'max-w-3xl'
        )}
      >
        {synced &&
          (isDatabase ? (
            <DatabaseEditor viewerRef={viewer} provider={provider} />
          ) : (
            <PageEditor
              viewerRef={viewer}
              provider={provider}
              pageId={pageId}
              renderComments={
                viewer && canComment
                  ? (editor, isEditable) => (
                      <PageComments
                        editor={editor}
                        isEditable={isEditable}
                        pageRef={commentsRef}
                        viewerId={viewer.id}
                        isPageOwner={access.viewer === 'owner'}
                        canFitRail={canFitThreadRail}
                        headerSlot={commentsSlot}
                      />
                    )
                  : undefined
              }
            />
          ))}
      </div>
    </div>
  )
}

export default Page
