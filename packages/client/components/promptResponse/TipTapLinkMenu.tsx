import * as Popover from '@radix-ui/react-popover'
import type {EditorEvents} from '@tiptap/core'
import {Editor, getMarkRange, getMarkType, getTextBetween, useEditorState} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
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
  useLinkEditor?: () => void
}
export const TipTapLinkMenu = (props: Props) => {
  const {editor, useLinkEditor} = props
  const [linkState, _setLinkState] = useState<LinkMenuState>(null)

  const setLinkState: typeof _setLinkState = (linkState) => {
    if (!linkState) {
      // closing the menu by hitting Esc should refocus on the editor
      editor.commands.focus()
    }
    _setLinkState(linkState)
  }

  useEffect(() => {
    const updateState = (change: EditorEvents['linkStateChange']) => {
      setLinkState(change.linkState)
    }
    editor.on('linkStateChange', updateState)
    return () => {
      editor.off('linkStateChange', updateState)
    }
  }, [])

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
  const oldLinkStateRef = useRef<LinkMenuState>(null)
  const handleEdit = () => {
    setLinkState('edit')
    oldLinkStateRef.current = 'preview'
  }

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
  const onOpenChange = (willOpen: boolean) => {
    const isLinkActive = editor.isActive('link')
    if (willOpen) {
      setLinkState(isLinkActive ? 'preview' : 'edit')
    } else {
      // special case when switching from preview to edit radix-ui triggers onOpenChange(false)
      if (!(oldLinkStateRef.current === 'preview' && linkState === 'edit')) {
        setLinkState(null)
      }
      oldLinkStateRef.current = null
    }
  }
  const transformRef = useRef<undefined | string>(undefined)
  const getTransform = () => {
    const coords = editor.view.coordsAtPos(editor.state.selection.from)
    const {left, top} = coords
    if (left !== 0 && top !== 0) {
      transformRef.current = `translate(${coords.left}px,${coords.top + 20}px)`
    }
    return transformRef.current
  }
  if (!linkState) return null
  return (
    <Popover.Root open onOpenChange={onOpenChange}>
      <Popover.Trigger asChild />
      <Popover.Portal>
        <Popover.Content
          asChild
          onOpenAutoFocus={(e) => {
            // necessary for link preview to prevent focusing the first button
            e.preventDefault()
          }}
        >
          <div className='absolute top-0 left-0 z-10' style={{transform: getTransform()}}>
            {linkState === 'edit' && (
              <TipTapLinkEditor
                initialUrl={link}
                initialText={text}
                onSetLink={onSetLink}
                useLinkEditor={useLinkEditor}
              />
            )}
            {linkState === 'preview' && (
              <TipTapLinkPreview url={link} onClear={onUnsetLink} onEdit={handleEdit} />
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default TipTapLinkMenu
