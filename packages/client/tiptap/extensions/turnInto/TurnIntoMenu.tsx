import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {SwapHoriz} from '~/ui/icons'
import {MENU_ITEM_ICON} from '../../../ui/Menu/MenuItem'
import {MenuRadioItem} from '../../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import {dispatchTurnInto} from './dispatchTurnInto'
import {type TurnIntoTarget, turnBlockInto} from './turnBlockInto'
import {findTurnIntoRow, getTurnIntoRows} from './turnIntoRows'

interface Props {
  editor: Editor
  node: Node
  pos: number
  current: TurnIntoTarget
  canCreateSubPage: boolean
}

export const TurnIntoMenu = (props: Props) => {
  const {editor, node, pos, current, canCreateSubPage} = props
  const rows = getTurnIntoRows(editor.state.doc, pos, current, canCreateSubPage)
  const currentRow = findTurnIntoRow(rows, current)

  const handleValueChange = (title: string) => {
    const {doc} = editor.state
    if (!editor.isEditable || pos > doc.content.size || !doc.nodeAt(pos)?.eq(node)) return
    const target = rows.find((row) => row.title === title)?.target
    const tr = target && turnBlockInto(editor.state, pos, target)
    if (!tr) return
    dispatchTurnInto(editor, tr, {hideDragHandle: tr.mapping.map(pos) !== pos})
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
        </MenuSubContent>
      </DropdownMenu.Sub>
      <MenuSeparator />
    </>
  )
}
