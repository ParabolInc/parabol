import DeleteIcon from '@mui/icons-material/Delete'
import * as Popover from '@radix-ui/react-popover'
import {ArchivedPagesRoot} from '../../modules/pages/ArchivedPagesRoot'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {LeftNavHeader} from './LeftNavHeader'

type Props = {}
export const LeftNavPagesTrash = (_props: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Popover.Root>
            <Popover.Trigger asChild>
              <div>
                <div className='group flex flex-1 cursor-pointer rounded-md font-semibold text-xs leading-5 hover:bg-slate-300'>
                  <LeftNavHeader>
                    <DeleteIcon className='text-slate-600' />
                    <span className='pl-1'>{'Trash'}</span>
                  </LeftNavHeader>
                </div>
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content asChild align='end' alignOffset={8} collisionPadding={8}>
                <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
                  <ArchivedPagesRoot />
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </TooltipTrigger>
      <TooltipContent side={'bottom'}>{'Restore archived page'}</TooltipContent>
    </Tooltip>
  )
}
