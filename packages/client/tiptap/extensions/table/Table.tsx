import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import TiptapTable, {TableOptions} from '@tiptap/extension-table'
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps
} from '@tiptap/react'
import {useState} from 'react'
import PlainButton from '../../../components/PlainButton/PlainButton'
import {cn} from '../../../ui/cn'
import {twStyled} from '../../../ui/twStyled'
import AddColumnLeft from './icons/AddColumnLeftSVG'
import AddColumnRight from './icons/AddColumnRightSVG'
import AddRowAbove from './icons/AddRowAboveSVG'
import AddRowBelow from './icons/AddRowBelowSVG'
import Backspace from './icons/BackspaceSVG'
import EditTableSVG from './icons/EditTableSVG'
import Toolbar from './icons/ToolbarSVG'

const Item = twStyled(DropdownMenu.Item)`
flex items-center gap-2 text-slate-700 hover:bg-slate-200 rounded px-2 py-1 cursor-pointer text-sm
`

type Highlight =
  | 'before'
  | 'after'
  | 'above'
  | 'below'
  | 'row'
  | 'column'
  | 'cell'
  | 'header'
  | null

function Component(props: NodeViewProps) {
  const {editor, node} = props

  const isActive = () => {
    const state = editor.view.state
    const from = state.selection.from
    const pos = state.doc.resolve(from)

    for (let i = pos.depth; i >= 0; --i) {
      if (pos.node(i) === node) {
        return true
      }
    }
    return false
  }

  const selected = isActive()

  const onOpenChange = (open: boolean) => {
    if (open) {
      editor.chain().focus().setCellAttribute('active', true).run()
    } else {
      editor.chain().focus().setCellAttribute('active', null).run()
    }
  }

  const [highlight, setHighlight] = useState<Highlight>(null)

  const focus = (what: Highlight) => () => setHighlight(what)
  const blur = () => setHighlight(null)

  return (
    <NodeViewWrapper className='relative' data-highlight={highlight}>
      <NodeViewContent as='table' {...props} />
      <DropdownMenu.Root onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger asChild>
          <PlainButton
            className={cn(
              'absolute -top-8 right-0 flex size-7 items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-300',
              {hidden: !selected}
            )}
          >
            <EditTableSVG />
          </PlainButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side='bottom'
            align='start'
            className='rounded bg-white p-2 shadow-lg'
          >
            <Item
              onFocus={focus('header')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().toggleHeaderRow().run()}
            >
              <Toolbar />
              Toggle header row
            </Item>
            <Item
              onFocus={focus('above')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().addRowBefore().run()}
            >
              <AddRowAbove />
              Add row above
            </Item>
            <Item
              onFocus={focus('below')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().addRowAfter().run()}
            >
              <AddRowBelow />
              Add row below
            </Item>
            <Item
              onFocus={focus('row')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().deleteRow().run()}
            >
              <Backspace />
              Remove row
            </Item>
            <Item
              onFocus={focus('before')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().addColumnBefore().run()}
            >
              <AddColumnLeft />
              Add column before
            </Item>
            <Item
              onFocus={focus('after')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().addColumnAfter().run()}
            >
              <AddColumnRight />
              Add column after
            </Item>
            <Item
              onFocus={focus('column')}
              onBlur={blur}
              onSelect={() => editor.chain().focus().deleteColumn().run()}
            >
              <Backspace />
              Remove column
            </Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </NodeViewWrapper>
  )
}
export const Table = TiptapTable.extend<TableOptions>({
  addNodeView() {
    return ReactNodeViewRenderer(Component, {contentDOMElementTag: 'tbody'})
  }
})
