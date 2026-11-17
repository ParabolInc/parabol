import * as Popover from '@radix-ui/react-popover'
import {type EditorEvents, posToDOMRect} from '@tiptap/core'
import {type Editor, getTextBetween, useEditorState} from '@tiptap/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {TipTapLinkEditor} from './TipTapLinkEditor'
import {TipTapLinkPreview} from './TipTapLinkPreview'
import {getRangeForType, type LinkMenuState} from './TiptapLinkExtension'

const getContent = (editor: Editor, typeOrName: string) => {
  const range = getRangeForType(editor.state, typeOrName)
  if (!range) return ''
  return getTextBetween(editor.state.doc, range)
}

interface Props {
  editor: Editor
  useLinkEditor?: () => void
}
export const TipTapLinkMenu = (props: Props) => {
  const {editor, useLinkEditor} = props
  const [linkState, _setLinkState] = useState<LinkMenuState>(null)
  const openStateRef = useRef<LinkMenuState>(null)

  const setLinkState = (nextLinkState: LinkMenuState) => {
    const menuWasOpen = openStateRef.current !== null
    openStateRef.current = nextLinkState
    _setLinkState(nextLinkState)
    if (!nextLinkState && menuWasOpen) {
      editor.commands.focus()
    }
  }

  useEffect(() => {
    const updateState = (change: EditorEvents['linkStateChange']) => {
      setLinkState(change.linkState)
    }
    editor.on('linkStateChange', updateState)
    return () => {
      editor.off('linkStateChange', updateState)
    }
  }, [editor])

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
  const handleEdit = () => {
    setLinkState('edit')
  }

  const onSetLink = useCallback(
    ({text, url}: {text: string; url: string}) => {
      editor.commands.upsertLink({text, url})
      setLinkState(null)
    },
    [editor]
  )
  const onUnsetLink = useCallback(() => {
    editor.commands.removeLink()
    setLinkState(null)
  }, [editor])
  const onOpenChange = (willOpen: boolean) => {
    const isLinkActive = editor.isActive('link')
    if (willOpen) {
      setLinkState(isLinkActive ? 'preview' : 'edit')
    } else {
      setLinkState(null)
    }
  }
  const lastAnchorRectRef = useRef(new DOMRect())
  const anchorRef = useMemo(
    () => ({
      current: {
        getBoundingClientRect: () => {
          // the view is unmounted while useEditor swaps in a new editor
          if (editor.isDestroyed) return lastAnchorRectRef.current
          const {state, view} = editor
          const {from, to} = getRangeForType(state, 'link') ?? state.selection
          lastAnchorRectRef.current = posToDOMRect(view, from, to)
          return lastAnchorRectRef.current
        }
      }
    }),
    [editor]
  )
  if (!linkState) return null
  return (
    <Popover.Root open onOpenChange={onOpenChange}>
      <Popover.Anchor virtualRef={anchorRef} />
      <Popover.Portal>
        <Popover.Content
          side='bottom'
          align='start'
          sideOffset={6}
          collisionPadding={8}
          updatePositionStrategy='always'
          className='z-dialog outline-hidden'
          onOpenAutoFocus={(e) => {
            // necessary for link preview to prevent focusing the first button
            e.preventDefault()
          }}
        >
          {linkState === 'edit' && (
            <TipTapLinkEditor
              initialUrl={link}
              initialText={text}
              onSetLink={onSetLink}
              onUnsetLink={onUnsetLink}
              useLinkEditor={useLinkEditor}
            />
          )}
          {linkState === 'preview' && (
            <TipTapLinkPreview url={link} onClear={onUnsetLink} onEdit={handleEdit} />
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default TipTapLinkMenu
