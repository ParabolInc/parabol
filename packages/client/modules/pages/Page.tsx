import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {Page_page$key} from '../../__generated__/Page_page.graphql'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {PageHeader} from './PageHeader'
import {PageHeaderPublic} from './PageHeaderPublic'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
  pageRef: Page_page$key
  isPublic?: boolean
}

export const Page = (props: Props) => {
  const {viewerRef, pageRef, isPublic} = props
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
      }
    `,
    pageRef
  )

  const {id: pageId, access} = page
  const {viewer: viewerAccess, public: publicAccess} = access
  const {editor, synced} = useTipTapPageEditor(pageId, {viewerRef})
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const isViewerEditable = ['owner', 'editor'].includes(viewerAccess || '')
    const isPublicEditable =
      ['owner', 'editor'].includes(publicAccess || '') && !!atmosphere.authObj
    const isEditable = isViewerEditable || isPublicEditable
    editor?.setEditable(isEditable)
  }, [editor, viewerAccess, publicAccess, atmosphere.authObj])
  if (!editor) return <div>No editor</div>
  return (
    <div className='relative flex w-full flex-col items-center bg-white'>
      {isPublic ? <PageHeaderPublic /> : <PageHeader pageRef={page} />}
      <div className='flex min-h-screen w-full max-w-[960px] justify-center bg-white pt-28 pb-10'>
        <TipTapEditor
          editor={editor}
          className={cn(
            'page-editor flex w-full px-6 opacity-0 delay-300',
            synced && 'opacity-100'
          )}
        />
      </div>
    </div>
  )
}

export default Page
