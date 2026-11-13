import {Autorenew, ContentCopy} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'

interface Props {
  name: string
  isOriginal: boolean
  isViewOnly: boolean
  onCopy: () => void
}

export const SyncedBlockBar = (props: Props) => {
  const {name, isOriginal, isViewOnly, onCopy} = props
  return (
    <div
      data-synced-chrome
      contentEditable={false}
      className={cn(
        'absolute right-[-2px] bottom-[calc(100%+2px)] left-[-2px] flex h-7 select-none items-center gap-2 whitespace-nowrap rounded-t-md pr-1 pl-2.5 text-xs',
        isViewOnly
          ? 'bg-surface-raised text-fg-secondary shadow-[inset_0_0_0_1px_var(--color-hairline-strong)]'
          : 'bg-accent-active text-white dark:text-grape-950'
      )}
    >
      <Autorenew className='text-[14px]' />
      <span className='min-w-[72px] shrink truncate font-semibold'>{name || 'Synced block'}</span>
      {isOriginal && !isViewOnly && (
        <span className='inline-flex h-4 shrink-0 items-center rounded-sm bg-[color-mix(in_srgb,currentColor_18%,transparent)] px-[5px] pb-px font-semibold text-xs leading-[14px] tracking-[.06em] [font-variant-caps:all-small-caps]'>
          Original
        </span>
      )}
      {isViewOnly && <span>View only</span>}
      <span className='flex-auto' />
      <Button
        onClick={onCopy}
        className={cn(
          'h-[22px] gap-1 rounded-sm px-1.5 font-medium',
          isViewOnly ? 'hover:bg-surface-hover' : 'hover:bg-white/18 dark:hover:bg-grape-950/16'
        )}
      >
        <ContentCopy className='text-[14px]' />
        <span>Copy and sync</span>
      </Button>
    </div>
  )
}
