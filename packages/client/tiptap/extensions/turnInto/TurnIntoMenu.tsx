import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {SwapHoriz} from '~/ui/icons'
import {MENU_ITEM_ICON} from '../../../ui/Menu/MenuItem'
import {MenuRadioItem} from '../../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import {canTurnIntoPage, isInsideCallout, type TurnIntoTarget, turnBlockInto} from './turnBlockInto'
import {turnIntoRows} from './turnIntoRows'

interface Props {
  editor: Editor
  node: Node
  pos: number
  current: TurnIntoTarget
  canCreateSubPage: boolean
}

const saveScroll = (element: Element) => {
  const scrolled: [Element, number, number][] = []
  for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
    scrolled.push([ancestor, ancestor.scrollLeft, ancestor.scrollTop])
  }
  return () => {
    for (const [ancestor, left, top] of scrolled) ancestor.scrollTo(left, top)
  }
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

  const handleValueChange = (title: string) => {
    const {doc} = editor.state
    if (!editor.isEditable || pos > doc.content.size || !doc.nodeAt(pos)?.eq(node)) return
    const target = rows.find((row) => row.title === title)?.target
    const tr = target && turnBlockInto(editor.state, pos, target)
    if (!tr) return
    const caret = tr.selection.from
    const isHandleOnAnotherBlock = tr.mapping.map(pos) !== pos
    const {dom} = editor.view
    // New node views start out short, and a page scrolled to its end would clamp to that height
    dom.style.minHeight = `${dom.offsetHeight}px`
    editor.view.dispatch(tr)
    // Focusing before new node views render makes WebKit jump near the end of the page
    setTimeout(() => {
      dom.style.minHeight = ''
      // WebKit scrolls to the caret when the editor takes focus, whatever preventScroll says
      const restoreScroll = saveScroll(dom)
      editor
        .chain()
        .setMeta('hideDragHandle', isHandleOnAnotherBlock)
        .focus(caret, {scrollIntoView: false})
        .run()
      restoreScroll()
    })
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
