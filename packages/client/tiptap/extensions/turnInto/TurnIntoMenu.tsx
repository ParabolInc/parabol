import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {Autorenew, SwapHoriz} from '~/ui/icons'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuRadioItem} from '../../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import {getBlockUnitAt} from '../../blockSelection/blockUnits'
import {dispatchBlockConversion} from './dispatchBlockConversion'
import {canTurnIntoPage, isInsideCallout, type TurnIntoTarget, turnBlockInto} from './turnBlockInto'
import {turnIntoRows} from './turnIntoRows'
import {turnRangeIntoSyncedBlock} from './turnRangeIntoSyncedBlock'

interface Props {
  editor: Editor
  node: Node
  pos: number
  current: TurnIntoTarget
  canCreateSubPage: boolean
  canCreateSyncedBlock: boolean
}

export const TurnIntoMenu = (props: Props) => {
  const {editor, node, pos, current, canCreateSubPage, canCreateSyncedBlock} = props
  const isInCallout = isInsideCallout(editor.state.doc, pos)
  const rows = turnIntoRows.filter(({target}) => {
    if (target.type === 'callout') return !isInCallout
    return target.type !== 'pageLinkBlock' || (canCreateSubPage && canTurnIntoPage(current))
  })
  const currentRow = rows.find(
    ({target}) => target.type === current.type && target.level === current.level
  )

  const getSyncedBlockTransaction = () => {
    const range = getBlockUnitAt(editor.state.doc, pos + 1)
    return range && turnRangeIntoSyncedBlock(editor.state, range)
  }
  const showSyncedBlock = editor.isEditable && canCreateSyncedBlock && !!getSyncedBlockTransaction()

  const isStale = () => {
    const {doc} = editor.state
    return !editor.isEditable || pos > doc.content.size || !doc.nodeAt(pos)?.eq(node)
  }

  const handleValueChange = (title: string) => {
    if (isStale()) return
    const target = rows.find((row) => row.title === title)?.target
    const tr = target && turnBlockInto(editor.state, pos, target)
    if (tr) dispatchBlockConversion(editor, tr, pos)
  }

  const handleSyncedBlock = () => {
    if (isStale()) return
    const tr = getSyncedBlockTransaction()
    if (tr) dispatchBlockConversion(editor, tr, pos)
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
