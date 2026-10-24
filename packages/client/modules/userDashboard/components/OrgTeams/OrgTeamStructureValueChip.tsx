import {useRef, useState} from 'react'
import {Close, Edit} from '~/ui/icons'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../../../ui/Menu/MenuItem'
import OrgTeamStructureNameInput from './OrgTeamStructureNameInput'

interface Props {
  name: string
  teamCount: number
  onRename: (name: string) => void
  onRemove: () => void
}

const OrgTeamStructureValueChip = ({name, teamCount, onRename, onRemove}: Props) => {
  const [isRenaming, setIsRenaming] = useState(false)
  // the input takes focus once the menu has closed, or the menu would hand focus back to its button
  const isRenameChosen = useRef(false)
  if (isRenaming) {
    return (
      <OrgTeamStructureNameInput
        label={`Rename ${name}`}
        initialName={name}
        className='w-36'
        onCommit={onRename}
        onClose={() => setIsRenaming(false)}
      />
    )
  }
  return (
    <Menu
      trigger={
        <button
          type='button'
          aria-label={`${name}, ${teamCount} ${teamCount === 1 ? 'team' : 'teams'}`}
          className='inline-flex h-7 cursor-pointer items-center rounded-sm bg-surface-well px-2 font-semibold text-[13px] text-fg-primary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          {name}
        </button>
      }
    >
      <MenuContent
        align='start'
        sideOffset={4}
        onCloseAutoFocus={(e) => {
          if (!isRenameChosen.current) return
          e.preventDefault()
          isRenameChosen.current = false
          setIsRenaming(true)
        }}
      >
        <MenuItem
          onSelect={() => {
            isRenameChosen.current = true
          }}
        >
          <Edit className={MENU_ITEM_ICON} />
          Rename
        </MenuItem>
        <MenuItem onSelect={onRemove}>
          <Close className={MENU_ITEM_ICON} />
          {teamCount > 0
            ? `Remove, leaving ${teamCount} ${teamCount === 1 ? 'team' : 'teams'} not set`
            : 'Remove'}
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export default OrgTeamStructureValueChip
