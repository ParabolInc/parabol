import * as Popover from '@radix-ui/react-popover'
import {Editor, getMarkRange, getMarkType, getTextBetween, useEditorState} from '@tiptap/react'
import {useCallback} from 'react'
import {TipTapLinkEditor} from './TipTapLinkEditor'
import {TipTapLinkPreview} from './TipTapLinkPreview'

const getContent = (editor: Editor, typeOrName: string) => {
  const range = getRangeForType(editor, typeOrName)
  if (!range) return ''
  return getTextBetween(editor.state.doc, range)
}

const getRangeForType = (editor: Editor, typeOrName: string) => {
  const {state} = editor
  const {selection, schema} = state
  const {$from} = selection
  const type = getMarkType(typeOrName, schema)
  return getMarkRange($from, type)
}

export type LinkMenuState = 'preview' | 'edit' | null
interface Props {
  editor: Editor
  linkState: LinkMenuState
  setLinkState: (linkState: LinkMenuState) => void
}
export const TipTapLinkMenu = (props: Props) => {
  const {editor, linkState, setLinkState} = props

  const getRect = () => {
    if (!editor) return {top: 0, left: 0}
    const coords = editor.view.coordsAtPos(editor.state.selection.from)
    return {
      top: coords.top,
      left: coords.left
    }
  }

  const {link, text} = useEditorState({
    editor,
    selector: ({editor}) => {
      const attrs = editor.getAttributes('link')
      if (attrs.href) {
        const text = getContent(editor, 'link')
        return {link: attrs.href, text}
      }
      const {state} = editor
      const {selection} = state
      const {from, to} = selection
      const text = getTextBetween(editor.state.doc, {from, to})
      return {link: '', text}
    }
  })

  const handleEdit = useCallback(() => {
    setLinkState('edit')
  }, [])

  const onSetLink = useCallback(
    ({text, url}: {text: string; url: string}) => {
      const range = getRangeForType(editor, 'link')
      if (!range) {
        const {state} = editor
        const {selection} = state
        const {from} = selection
        const nextTo = from + text.length
        // adding a new link
        editor
          .chain()
          .focus()
          .command(({tr}) => {
            tr.insertText(text)
            return true
          })
          .setTextSelection({
            from,
            to: nextTo
          })
          .setLink({href: url, target: '_blank'})
          .setTextSelection({from: nextTo, to: nextTo})
          .run()
        return
      }
      const {from} = range
      const to = from + text.length
      editor
        .chain()
        .focus()
        .setTextSelection(range)
        .insertContent(text)
        .setTextSelection({
          from,
          to
        })
        .setLink({href: url, target: '_blank'})
        .setTextSelection({from: to, to})
        .run()
      setLinkState(null)
    },
    [editor]
  )
  const onUnsetLink = useCallback(() => {
    const range = getRangeForType(editor, 'link')
    if (!range) return
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .setTextSelection({from: range.to, to: range.to})
      .run()
    setLinkState(null)
  }, [editor])

  const rect = getRect()
  const transform = `translate(${rect.left}px,${rect.top + 20}px)`
  const onOpenChange = (willOpen: boolean) => {
    setLinkState(willOpen ? (editor.isActive('link') ? 'preview' : 'edit') : null)
  }
  return (
    <Popover.Root open onOpenChange={onOpenChange}>
      <Popover.Trigger asChild />
      <Popover.Portal>
        <Popover.Content>
          <div className='absolute left-0 top-0' style={{transform}}>
            {linkState === 'edit' && (
              <TipTapLinkEditor initialUrl={link} initialText={text} onSetLink={onSetLink} />
            )}
            {linkState === 'preview' && (
              <TipTapLinkPreview url={link} onClear={onUnsetLink} onEdit={handleEdit} />
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
  return null
}

export default TipTapLinkMenu
