import {AutoAwesome, Refresh, Tune as TuneIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {metaLine} from './inspirationCopy'

interface Props {
  workItemCount?: number
  since: string
  promptCount: number
  onRegenerate: () => void
  regenerating: boolean
  onTune: () => void
  tuneDirty: boolean
}

const InspirationDraftHeader = (props: Props) => {
  const {workItemCount, since, promptCount, onRegenerate, regenerating, onTune, tuneDirty} = props
  return (
    <div className='flex flex-col gap-1 px-4 pt-3 pb-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5 font-semibold text-fg-primary text-sm'>
          <AutoAwesome className='h-[18px] w-[18px] text-accent' />
          Your draft
        </div>
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='flat'
                shape='icon'
                aria-label='Draft my response from this work'
                className='h-8 w-8 p-0 text-fg-secondary'
                disabled={regenerating}
                onClick={onRegenerate}
              >
                <Refresh className='h-[18px] w-[18px]' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Draft my response from this work</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='flat'
                shape='icon'
                aria-label='Customize instructions'
                data-dirty={tuneDirty ? '' : undefined}
                className='h-8 w-8 p-0 text-fg-secondary data-dirty:ring-2 data-dirty:ring-sky-300'
                disabled={regenerating}
                onClick={onTune}
              >
                <TuneIcon className='h-[18px] w-[18px]' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Customize how the AI drafts your response</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className='text-fg-muted text-xs'>{metaLine(workItemCount, since, promptCount)}</div>
    </div>
  )
}

export default InspirationDraftHeader
