import type {EmbedAspectRatio} from '../../../shared/embed/embedTypes'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

const RATIOS: {value: EmbedAspectRatio; label: string; short: string}[] = [
  {value: '16:9', label: 'Widescreen', short: '16:9'},
  {value: '4:3', label: 'Standard', short: '4:3'},
  {value: '1:1', label: 'Square', short: '1:1'},
  {value: 'tall', label: 'Tall', short: '3:4'}
]

interface Props {
  aspectRatio: EmbedAspectRatio
  onSelect: (aspectRatio: EmbedAspectRatio) => void
}

export const EmbedBlockAspectMenu = (props: Props) => {
  const {aspectRatio, onSelect} = props
  const current = RATIOS.find(({value}) => value === aspectRatio) ?? RATIOS[0]!
  return (
    <Menu
      trigger={
        <div className='flex items-center'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className='flex h-7 cursor-pointer items-center justify-center rounded-sm px-2 font-mono text-fg-primary text-xs transition-colors hover:bg-surface-hover'>
                {current.short}
              </button>
            </TooltipTrigger>
            <TooltipContent>Aspect ratio</TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <MenuContent align='center' side='bottom' sideOffset={4}>
        {RATIOS.map(({value, label, short}) => (
          <MenuItem key={value} onSelect={() => onSelect(value)}>
            <span
              className={aspectRatio === value ? 'font-semibold text-accent' : 'text-fg-primary'}
            >
              {label}
            </span>
            <span className='ml-auto pl-4 font-mono text-fg-muted text-xs'>{short}</span>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}
