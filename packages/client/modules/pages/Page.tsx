import * as Popover from '@radix-ui/react-popover'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import useRouter from '../../hooks/useRouter'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {PageSharingRoot} from './PageSharingRoot'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
}

export const Page = (props: Props) => {
  const {viewerRef} = props
  const {match} = useRouter<{orgName: string; pageSlug: string}>()
  const {params} = match
  const {pageSlug} = params
  const pageCodeIdx = pageSlug.lastIndexOf('-')
  const pageId = `page:${Number(pageCodeIdx === -1 ? pageSlug : pageSlug.slice(pageCodeIdx + 1))}`
  const {editor, provider} = useTipTapPageEditor(pageId, {viewerRef})
  if (!editor) return <div>No editor</div>
  if (!pageSlug) return <div>No page ID provided in route</div>
  editor
  return (
    <div className='flex w-full flex-col items-center bg-white pt-2'>
      <div className='relative flex min-h-screen w-full max-w-[960px] justify-center bg-white pt-28 pb-10'>
        <div className='absolute top-0 right-12 flex'>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className='text-md fixed cursor-pointer bg-white pt-1 font-semibold'>
                Share
              </button>
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
        <TipTapEditor
          editor={editor}
          className={cn('page-editor flex w-full px-6 opacity-0', provider.synced && 'opacity-100')}
        />
      </div>
    </div>
  )
}

export default Page
