import * as Popover from '@radix-ui/react-popover'
import {PageSharingRoot} from '../../../modules/pages/PageSharingRoot'
import {GQLID} from '../../../utils/GQLID'
import {SyncedBlockAccessLineRoot} from './SyncedBlockAccessLineRoot'

interface Props {
  pageCode: number
  name: string
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

export const SyncedBlockWhoHasAccess = (props: Props) => {
  const {pageCode, name, onClose, onCloseAutoFocus} = props
  return (
    <Popover.Root open onOpenChange={(open) => !open && onClose()}>
      <Popover.Anchor asChild>
        <span contentEditable={false} className='absolute top-0 right-0 size-0' />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          asChild
          align='end'
          collisionPadding={8}
          className='z-10'
          aria-label='Who has access to this synced block'
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg border border-hairline bg-surface-card shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
            <div className='flex flex-col gap-1 px-3 pt-3 pb-3 text-fg-primary'>
              <h2 className='m-0 font-semibold text-base'>{name || 'Synced block'}</h2>
              <SyncedBlockAccessLineRoot pageCode={pageCode} />
            </div>
            <div className='border-hairline border-t' />
            <PageSharingRoot pageId={GQLID.toKey(pageCode, 'page')} hideCopyLink />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
