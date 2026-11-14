import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {type Editor, useEditorState} from '@tiptap/react'
import {ExpandMore} from '~/ui/icons'
import {getSelectionBlockPos} from '../../tiptap/extensions/dragHandleRules'
import {dispatchTurnInto} from '../../tiptap/extensions/turnInto/dispatchTurnInto'
import {getTurnIntoTarget, turnBlockInto} from '../../tiptap/extensions/turnInto/turnBlockInto'
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
  const selected = useEditorState({
    editor,
    selector: ({editor}) => {
      const pos = getSelectionBlockPos(editor.view)
      const current = pos === null ? null : getTurnIntoTarget(editor.state.doc, pos)
      return pos === null || !current ? null : {pos, current}
    }
  })

  if (!selected) return null
  const {pos, current} = selected
  const rows = getTurnIntoRows(editor.state.doc, pos, current, canCreateSubPage)
  const currentRow = findTurnIntoRow(rows, current)

  const handleValueChange = (title: string) => {
    const target = rows.find((row) => row.title === title)?.target
    if (!editor.isEditable || !target) return
    const tr = turnBlockInto(editor.state, pos, target)
    if (tr) dispatchTurnInto(editor, tr)
  }

  const focusEditor = () => editor.view.focus()

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
        <MenuContent
          align='start'
          sideOffset={4}
          collisionPadding={8}
          className='z-50 max-h-80'
          onPointerDownOutside={focusEditor}
          onEscapeKeyDown={focusEditor}
          onCloseAutoFocus={(e) => e.preventDefault()}
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
