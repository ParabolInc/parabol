import type {EditorEvents} from '@tiptap/core'
import {Editor, getTextBetween, useEditorState} from '@tiptap/react'
import {
  getRangeForType,
  LinkMenuState
} from 'parabol-client/components/promptResponse/TiptapLinkExtension'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Popover} from 'react-bootstrap'
import {TipTapLinkEditor} from './LinkEditor'
import {TipTapLinkPreview} from './LinkPreview'

const getContent = (editor: Editor, typeOrName: string) => {
  const range = getRangeForType(editor.state, typeOrName)
  if (!range) return ''
  return getTextBetween(editor.state.doc, range)
}

interface Props {
  editor: Editor
  useLinkEditor?: () => void
}
export const LinkMenu = (props: Props) => {
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
      editor.commands.upsertLink({text, url})
      setLinkState(null)
    },
    [editor]
  )
  const onUnsetLink = useCallback(() => {
    editor.commands.removeLink()
    setLinkState(null)
  }, [editor])

  const transformRef = useRef<{left?: string; top?: string}>({})
  const getTransform = () => {
    const coords = editor.view.coordsAtPos(editor.state.selection.from)
    const viewCoords = editor.view.dom.getBoundingClientRect()
    const {left, top} = coords
    if (left !== 0 && top !== 0) {
      const left = coords.left - viewCoords.left
      const top = coords.top
      transformRef.current = {left: `${left}px`, top: `${top}px`}
    }
    return transformRef.current
  }
  if (!linkState) return null
  return (
    <Popover
      placement='bottom'
      className='fixed p-0'
      positionLeft={getTransform().left}
      positionTop={getTransform().top}
    >
      <div>
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
    </Popover>
  )
}

export default LinkMenu
