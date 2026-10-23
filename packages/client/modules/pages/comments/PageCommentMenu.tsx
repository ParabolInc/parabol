import {useRef} from 'react'
import {Delete as DeleteIcon, Edit as EditIcon, MoreVert as MoreVertIcon} from '~/ui/icons'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'

interface Props {
  isThreadStarter: boolean
  onEdit?: () => void
  onDelete: () => void
}

export const PageCommentMenu = (props: Props) => {
  const {isThreadStarter, onEdit, onDelete} = props
  // The menu hands focus back to its trigger when it closes, which would take it from the
  // comment that Edit just made editable, so editing starts in place of that
  const isEditSelectedRef = useRef(false)
  return (
    <Menu
      trigger={
        <button
          aria-label='Comment options'
          className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          <MoreVertIcon className='text-[18px]' />
        </button>
      }
    >
      <MenuContent
        align='end'
        sideOffset={4}
        className='min-w-40'
        onCloseAutoFocus={(event) => {
          if (!isEditSelectedRef.current) return
          isEditSelectedRef.current = false
          event.preventDefault()
          onEdit?.()
        }}
      >
        {onEdit && (
          <MenuItem
            onSelect={() => {
              isEditSelectedRef.current = true
            }}
          >
            <EditIcon className={MENU_ITEM_ICON} />
            Edit
          </MenuItem>
        )}
        <MenuItem onSelect={onDelete}>
          <DeleteIcon className={MENU_ITEM_ICON} />
          {isThreadStarter ? 'Delete thread' : 'Delete comment'}
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}
