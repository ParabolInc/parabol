import {Check} from '~/ui/icons'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {MenuItemCheckbox} from '../../ui/Menu/MenuItemCheckbox'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  teamName: string
  orgName: string | null
  isSelected: boolean
  isMultiple: boolean
  disabledReason?: string
  onSelect: () => void
}

const TeamPickerMenuItem = (props: Props) => {
  const {teamName, orgName, isSelected, isMultiple, disabledReason, onSelect} = props
  const label = (
    <div className='min-w-0 grow'>
      <div className='truncate'>{teamName}</div>
      {orgName && <div className='truncate text-fg-muted text-xs'>{orgName}</div>}
    </div>
  )
  if (!isMultiple) {
    return (
      <MenuItem onClick={onSelect} className='gap-2'>
        {label}
        {isSelected && <Check className='h-5 w-5 shrink-0 text-accent-active' />}
      </MenuItem>
    )
  }
  const item = (
    <MenuItemCheckbox
      checked={isSelected}
      disabled={!!disabledReason}
      onClick={() => !disabledReason && onSelect()}
    >
      {label}
    </MenuItemCheckbox>
  )
  if (!disabledReason) return item
  return (
    <Tooltip>
      <TooltipTrigger asChild>{item}</TooltipTrigger>
      <TooltipContent side='right' className='max-w-56 whitespace-normal'>
        {disabledReason}
      </TooltipContent>
    </Tooltip>
  )
}

export default TeamPickerMenuItem
