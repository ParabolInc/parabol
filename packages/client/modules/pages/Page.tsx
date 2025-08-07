import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {Page_page$key} from '../../__generated__/Page_page.graphql'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {PageBreadCrumbs} from './PageBreadCrumbs'
import {PageSharingRoot} from './PageSharingRoot'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
  pageRef: Page_page$key
}

export const Page = (props: Props) => {
  const {viewerRef, pageRef} = props
  const page = useFragment(
    graphql`
      fragment Page_page on Page {
            ...PageBreadCrumbs_page
            id
            ancestorIds
            access {
              viewer
            }
      }
    `,
    pageRef
  )

  const {id: pageId, access} = page
  const {viewer: viewerAccess} = access
  const {editor, synced} = useTipTapPageEditor(pageId, {viewerRef})
  useEffect(() => {
    const readOnly = viewerAccess === 'commenter' || viewerAccess === 'viewer'
    editor?.setEditable(!readOnly)
  }, [editor, viewerAccess])
  if (!editor) return <div>No editor</div>
  return (
    <div className='relative flex w-full flex-col items-center bg-white pt-2'>
      <div className='flex w-full items-center justify-between'>
        <PageBreadCrumbs pageRef={page} />
        <div className='px-2'>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className='cursor-pointer bg-white pt-1 font-semibold text-md'>Share</button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content asChild align='end' alignOffset={8} collisionPadding={8}>
                <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
                  <PageSharingRoot pageId={pageId} />
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
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
