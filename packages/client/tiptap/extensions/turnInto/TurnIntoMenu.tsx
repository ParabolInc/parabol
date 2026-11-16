import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {Autorenew, SwapHoriz} from '~/ui/icons'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuRadioItem} from '../../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import {dispatchBlockConversion} from './dispatchBlockConversion'
import {
  dispatchSyncedBlockConversion,
  getBlockRange,
  getSyncedBlockConversion
} from './getSyncedBlockConversion'
import {canTurnIntoPage, isInsideCallout, type TurnIntoTarget, turnBlockInto} from './turnBlockInto'
import {turnIntoRows} from './turnIntoRows'

interface Props {
  editor: Editor
  node: Node
  pos: number
  current: TurnIntoTarget
  canCreateSubPage: boolean
}

export const TurnIntoMenu = (props: Props) => {
  const {editor, node, pos, current, canCreateSubPage} = props
  const isInCallout = isInsideCallout(editor.state.doc, pos)
  const rows = turnIntoRows.filter(({target}) => {
    if (target.type === 'callout') return !isInCallout
    return target.type !== 'pageLinkBlock' || (canCreateSubPage && canTurnIntoPage(current))
  })
  const currentRow = rows.find(
    ({target}) => target.type === current.type && target.level === current.level
  )

  const getRange = () => getBlockRange(editor, node, pos)
  const showSyncedBlock = canCreateSubPage && !!getSyncedBlockConversion(editor, getRange())

  const isStale = () => !editor.isEditable || !getRange()

  const handleValueChange = (title: string) => {
    if (isStale()) return
    const target = rows.find((row) => row.title === title)?.target
    const tr = target && turnBlockInto(editor.state, pos, target)
    if (tr) dispatchBlockConversion(editor, tr, pos)
  }

  const handleSyncedBlock = () => {
    dispatchSyncedBlockConversion(editor, getRange(), pos)
  }

  return (
    <>
      {currentRow && (
        <DropdownMenu.Label className='select-none px-3 py-1 font-semibold text-fg-muted text-xs'>
          {currentRow.title}
        </DropdownMenu.Label>
      )}
      <DropdownMenu.Sub>
        <MenuSubTrigger>
          <SwapHoriz className={MENU_ITEM_ICON} />
          Turn into
        </MenuSubTrigger>
        <MenuSubContent className='z-50 max-h-80 min-w-[200px]' collisionPadding={8}>
          <DropdownMenu.RadioGroup value={currentRow?.title} onValueChange={handleValueChange}>
            {rows.map(({title, icon: Icon}) => (
              <MenuRadioItem key={title} value={title}>
                <Icon className={MENU_ITEM_ICON} />
                {title}
              </MenuRadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          {showSyncedBlock && (
            <>
              <MenuSeparator />
              <MenuItem onSelect={handleSyncedBlock}>
                <Autorenew className={MENU_ITEM_ICON} />
                Synced block
              </MenuItem>
            </>
          )}
        </MenuSubContent>
      </DropdownMenu.Sub>
      <MenuSeparator />
    </>
  )
}
