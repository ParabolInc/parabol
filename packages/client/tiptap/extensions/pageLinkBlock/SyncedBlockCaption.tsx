import {Autorenew} from '~/ui/icons'

interface Props {
  name: string
}

export const SyncedBlockCaption = ({name}: Props) => (
  <div
    contentEditable={false}
    className='pointer-events-none absolute bottom-[calc(100%+2px)] left-3 flex select-none items-center gap-1 whitespace-nowrap text-fg-muted text-xs'
  >
    <Autorenew className='text-[12px]' />
    <span>{name || 'Synced block'}</span>
  </div>
)
