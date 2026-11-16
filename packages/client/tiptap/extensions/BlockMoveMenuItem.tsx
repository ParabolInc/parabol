import {ArrowDownward, ArrowUpward} from '~/ui/icons'
import {MENU_ITEM_ICON, MenuItem} from '../../ui/Menu/MenuItem'
import {modKey} from '../../utils/platform'

type Direction = 'up' | 'down'

interface Props {
  direction: Direction
  canMove: boolean
  onMove: (direction: Direction) => void
}

const BlockMoveMenuItem = ({direction, canMove, onMove}: Props) => {
  const isUp = direction === 'up'
  const Icon = isUp ? ArrowUpward : ArrowDownward
  const handleSelect = (e: Event) => {
    if (!canMove) {
      e.preventDefault()
      return
    }
    onMove(direction)
  }
  return (
    <MenuItem onSelect={handleSelect} isDisabled={!canMove} aria-disabled={!canMove}>
      <Icon className={MENU_ITEM_ICON} />
      <span className='flex-1 text-left'>{isUp ? 'Move up' : 'Move down'}</span>
      <span className='ml-4 text-fg-muted text-xs'>
        {modKey}+Shift+{isUp ? '↑' : '↓'}
      </span>
    </MenuItem>
  )
}

export default BlockMoveMenuItem
