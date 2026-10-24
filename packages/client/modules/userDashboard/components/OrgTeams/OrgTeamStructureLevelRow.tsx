import type {DraggableProvided} from '@hello-pangea/dnd'
import {useState} from 'react'
import {Add, Delete, DragIndicator, MoreVert} from '~/ui/icons'
import {MAX_TEAM_STRUCTURE_VALUES} from '../../../../shared/reports/reportCatalog'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../../../ui/Menu/MenuItem'
import OrgTeamStructureNameInput from './OrgTeamStructureNameInput'
import OrgTeamStructureRemoveLevelDialog from './OrgTeamStructureRemoveLevelDialog'
import OrgTeamStructureValueChip from './OrgTeamStructureValueChip'
import {
  addValue,
  removeLevel,
  removeValue,
  renameLevel,
  renameValue,
  type TeamStructureEdit,
  type TeamStructureLevelData
} from './teamStructureEdits'

interface Props {
  level: TeamStructureLevelData
  position: number
  dragProvided: DraggableProvided
  // changes after a failed save, which puts back the typed names
  failedSaveCount: number
  onEdit: (edit: TeamStructureEdit) => void
}

const OrgTeamStructureLevelRow = (props: Props) => {
  const {level, position, dragProvided, failedSaveCount, onEdit} = props
  const {id: levelId, name, values} = level
  const [isAddingValue, setIsAddingValue] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const canAddValue = values.length < MAX_TEAM_STRUCTURE_VALUES
  return (
    <li
      ref={dragProvided.innerRef}
      {...dragProvided.draggableProps}
      className='flex flex-wrap items-center gap-x-3 gap-y-2 border-hairline border-t bg-surface-card py-2.5 pr-3 pl-2'
    >
      <span
        {...dragProvided.dragHandleProps}
        aria-label={`Reorder ${name}`}
        className='flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover'
      >
        <DragIndicator className='text-[20px]' />
      </span>
      <span className='w-4 shrink-0 font-semibold text-[13px] text-fg-muted tabular-nums'>
        {position + 1}
      </span>
      <OrgTeamStructureNameInput
        key={`${name}:${failedSaveCount}`}
        label={`Name of level ${position + 1}`}
        initialName={name}
        autoFocus={false}
        className='h-9 w-37 shrink-0 text-sm'
        onCommit={(nextName) => onEdit(renameLevel(levelId, nextName))}
      />
      <div className='flex min-w-0 flex-[1_1_240px] flex-wrap items-center gap-1.5'>
        {values.map((value) => (
          <OrgTeamStructureValueChip
            key={value.id}
            name={value.name}
            teamCount={value.teamIds.length}
            onRename={(nextName) => onEdit(renameValue(levelId, value.id, nextName))}
            onRemove={() => onEdit(removeValue(levelId, value.id))}
          />
        ))}
        {canAddValue &&
          (isAddingValue ? (
            <OrgTeamStructureNameInput
              label={`New value of ${name}`}
              placeholder='Value name'
              className='w-36'
              onCommit={(valueName) => onEdit(addValue(levelId, valueName))}
              onClose={() => setIsAddingValue(false)}
            />
          ) : (
            <button
              type='button'
              onClick={() => setIsAddingValue(true)}
              className='inline-flex h-7 cursor-pointer items-center gap-0.5 rounded-sm border border-hairline-strong border-dashed pr-2 pl-1 font-semibold text-[13px] text-fg-secondary hover:bg-surface-hover'
            >
              <Add className='text-[18px]' />
              Add
            </button>
          ))}
      </div>
      <Menu
        trigger={
          <button
            type='button'
            aria-label={`More options for ${name}`}
            className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
          >
            <MoreVert className='text-[20px]' />
          </button>
        }
      >
        <MenuContent align='end' sideOffset={4}>
          <MenuItem onSelect={() => setIsRemoving(true)}>
            <Delete className={MENU_ITEM_ICON} />
            Remove level
          </MenuItem>
        </MenuContent>
      </Menu>
      <OrgTeamStructureRemoveLevelDialog
        levelName={name}
        isOpen={isRemoving}
        onClose={() => setIsRemoving(false)}
        onConfirm={() => {
          setIsRemoving(false)
          onEdit(removeLevel(levelId))
        }}
      />
    </li>
  )
}

export default OrgTeamStructureLevelRow
