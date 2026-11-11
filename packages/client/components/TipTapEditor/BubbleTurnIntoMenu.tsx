import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {type Editor, useEditorState} from '@tiptap/react'
import {useRef} from 'react'
import {ExpandMore} from '~/ui/icons'
import {dispatchTurnInto} from '../../tiptap/extensions/turnInto/dispatchTurnInto'
import {
  getSelectionTurnIntoPos,
  getTurnIntoTarget,
  turnBlockInto
} from '../../tiptap/extensions/turnInto/turnBlockInto'
import {findTurnIntoRow, getTurnIntoRows} from '../../tiptap/extensions/turnInto/turnIntoRows'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON} from '../../ui/Menu/MenuItem'
import {MenuRadioItem} from '../../ui/Menu/MenuRadioItem'
import {BubbleMenuButton} from './BubbleMenuButton'

interface Props {
  editor: Editor
  canCreateSubPage: boolean
}

export const BubbleTurnIntoMenu = (props: Props) => {
  const {editor, canCreateSubPage} = props
  const isFocusHandledRef = useRef(false)
  const current = useEditorState({
    editor,
    selector: ({editor}) => {
      const {state} = editor
      const pos = getSelectionTurnIntoPos(state)
      return pos === null ? null : getTurnIntoTarget(state.doc, pos)
    }
  })

  if (!current) return null
  const rows = getTurnIntoRows(current, canCreateSubPage)
  const currentRow = findTurnIntoRow(rows, current)

  const handleValueChange = (title: string) => {
    const {state} = editor
    const pos = getSelectionTurnIntoPos(state)
    const target = rows.find((row) => row.title === title)?.target
    if (!editor.isEditable || pos === null || !target) return
    const tr = turnBlockInto(state, pos, target)
    if (!tr) return
    isFocusHandledRef.current = true
    dispatchTurnInto(editor, tr)
  }

  const handlePointerDownOutside = () => {
    // Give focus back before the click lands, so the click decides where it goes next
    isFocusHandledRef.current = true
    editor.view.focus()
  }

  const handleCloseAutoFocus = (e: Event) => {
    e.preventDefault()
    if (!isFocusHandledRef.current) editor.view.focus()
    isFocusHandledRef.current = false
  }

  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <BubbleMenuButton
            className='w-auto gap-0.5 whitespace-nowrap pr-0.5 pl-1.5 text-sm data-[state=open]:bg-surface-hover'
            title='Turn into'
          >
            {currentRow?.title ?? 'Turn into'}
            <ExpandMore className='h-[18px] w-[18px] text-fg-secondary' />
          </BubbleMenuButton>
        </DropdownMenu.Trigger>
        {/* Not portaled: the bubble menu stays up only while focus is inside its element */}
        <MenuContent
          align='start'
          sideOffset={4}
          collisionPadding={8}
          className='z-50 max-h-80'
          onPointerDownOutside={handlePointerDownOutside}
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          <DropdownMenu.RadioGroup value={currentRow?.title} onValueChange={handleValueChange}>
            {rows.map(({title, icon: Icon}) => (
              <MenuRadioItem key={title} value={title}>
                <Icon className={MENU_ITEM_ICON} />
                {title}
              </MenuRadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </MenuContent>
      </DropdownMenu.Root>
      <div className='mx-[3px] h-[18px] w-px bg-hairline' />
    </>
  )
}
