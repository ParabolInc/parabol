import type {Editor} from '@tiptap/core'
import type {Transaction} from '@tiptap/pm/state'

const saveScroll = (element: Element) => {
  const scrolled: [Element, number, number][] = []
  for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
    scrolled.push([ancestor, ancestor.scrollLeft, ancestor.scrollTop])
  }
  return () => {
    for (const [ancestor, left, top] of scrolled) ancestor.scrollTo(left, top)
  }
}

export const dispatchBlockConversion = (editor: Editor, tr: Transaction, pos: number) => {
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
