import * as Popover from '@radix-ui/react-popover'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import useRouter from '../../hooks/useRouter'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {PageSharingRoot} from './PageSharingRoot'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
}

export const Page = (props: Props) => {
  const {viewerRef} = props
  const {match} = useRouter<{orgName: string; pageSlug: string}>()
  const {params} = match
  const {pageSlug} = params
  const pageIdIdx = pageSlug.lastIndexOf('-')
  const pageId = `page:${Number(pageIdIdx === -1 ? pageSlug : pageSlug.slice(pageIdIdx + 1))}`
  const {editor} = useTipTapPageEditor(pageId, {viewerRef})
  if (!editor) return <div>No editor</div>
  if (!pageSlug) return <div>No page ID provided in route</div>
  return (
    <div className='flex w-full flex-col items-center bg-slate-200 pt-2'>
      <div className='relative flex min-h-screen w-full max-w-[960px] justify-center bg-white pt-28 pb-4'>
        <div className='absolute top-0 right-12 flex'>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className='fixed cursor-pointer bg-white pt-1'>Share</button>
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
        <TipTapEditor editor={editor} className='page-editor flex w-full px-6' />
      </div>
    </div>
  )
}

export default Page
