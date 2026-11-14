import {type NodeViewProps, NodeViewWrapper, useEditorState} from '@tiptap/react'
import {useMemo} from 'react'
import {getTableOfContentsItems} from '../../../shared/tiptap/getTableOfContentsItems'
import {cn} from '../../../ui/cn'

const INDENT_BY_DEPTH = ['', 'pl-5', 'pl-10']
const HEADING_SCROLL_GAP = 16

const getScrollParent = (el: HTMLElement) => {
  let parent = el.parentElement
  while (parent) {
    const {overflowY} = getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

export const TableOfContentsView = (props: NodeViewProps) => {
  const {editor} = props
  const {doc, isEditable} = useEditorState({
    editor,
    selector: ({editor}) => ({doc: editor.state.doc, isEditable: editor.isEditable}),
    equalityFn: (a, b) => !!b && a.doc === b.doc && a.isEditable === b.isEditable
  })
  const items = useMemo(() => getTableOfContentsItems(doc), [doc])
  const scrollToHeading = (pos: number) => {
    const dom = editor.view.nodeDOM(pos)
    if (!(dom instanceof HTMLElement)) return
    const scroller = getScrollParent(dom)
    if (!scroller) return
    const headerHeight =
      document.querySelector('[data-page-header]')?.getBoundingClientRect().height ?? 0
    const top =
      dom.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      headerHeight -
      HEADING_SCROLL_GAP
    scroller.scrollTo({top, behavior: 'smooth'})
  }
  return (
    <NodeViewWrapper className='my-2 rounded-sm px-1 py-1 transition-colors empty:my-0 empty:py-0 group-[.ProseMirror-selectednode]:bg-surface-hover'>
      {items.length === 0 ? (
        isEditable && (
          <p className='m-0 text-fg-muted text-sm italic'>
            Add headings to build a table of contents
          </p>
        )
      ) : (
        <nav aria-label='Table of contents' className='flex flex-col'>
          {items.map(({pos, depth, text}) => (
            <button
              key={pos}
              type='button'
              onClick={() => scrollToHeading(pos)}
              className={cn(
                'w-full cursor-pointer truncate rounded-sm text-left text-base text-fg-primary leading-relaxed underline decoration-1 decoration-hairline-strong underline-offset-[0.2em] transition-[text-decoration-color] duration-150 hover:decoration-current focus-visible:outline-2 focus-visible:outline-accent',
                INDENT_BY_DEPTH[depth]
              )}
            >
              {text}
            </button>
          ))}
        </nav>
      )}
    </NodeViewWrapper>
  )
}
