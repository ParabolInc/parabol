import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import {EditorContent, EditorEvents, JSONContent, PureEditorContent, useEditor} from '@tiptap/react'
import areEqual from 'fbjs/lib/areEqual'
import React, {useRef, useState} from 'react'
import useForceUpdate from '~/hooks/useForceUpdate'
import {PALETTE} from '~/styles/paletteV3'
import {BBox} from '~/types/animations'
import EditorLinkChangerTipTap from '../EditorLinkChanger/EditorLinkChangerTipTap'
import EditorLinkViewerTipTap from '../EditorLinkViewer/EditorLinkViewerTipTap'
import {createEditorExtensions} from './tiptapConfig'

const StyledEditor = styled('div')`
  .ProseMirror {
    min-height: 40px;
  }
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  .ProseMirror-focused:focus {
    outline: none;
  }

  a {
    text-decoration: underline;
    color: ${PALETTE.SLATE_600};
    :hover {
      cursor: pointer;
    }
  }
`

interface Props {
  autoFocus?: boolean
  content: JSONContent | null
  handleSubmit?: (editor: EditorState) => void
  readOnly: boolean
  placeholder?: string
}

const PromptResponseEditor = (props: Props) => {
  const {autoFocus: autoFocusProp, content, handleSubmit, readOnly, placeholder} = props
  const [_isEditing, setIsEditing] = useState(autoFocusProp ?? false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [linkMenuProps, setLinkMenuProps] = useState<{text: string; href: string} | undefined>()
  const [selectedHref, setSelectedHref] = useState<string | null>(null)
  const editorRef = useRef<PureEditorContent>(null)
  const forceUpdate = useForceUpdate()

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
  }

  const onUpdate = () => {
    setEditing(true)
  }

  const onSubmit = ({editor: newEditorState}: EditorEvents['blur']) => {
    setEditing(false)
    const newContent = newEditorState.getJSON()

    // to avoid creating an empty post on first blur
    if (!content && newEditorState.isEmpty) return

    if (areEqual(content, newContent)) return

    handleSubmit?.(newEditorState)
  }

  const handleOpenLinkChanger = ({text, href}: {text: string; href: string}) => {
    setSelectedHref(null)
    setLinkMenuProps({text, href})
  }

  const editor = useEditor(
    {
      content,
      extensions: createEditorExtensions(handleOpenLinkChanger, setSelectedHref, placeholder),
      autofocus: autoFocus,
      onUpdate,
      onBlur: onSubmit,
      editable: !readOnly
    },
    [content, setLinkMenuProps]
  )

  const cachedCoordsRef = useRef<BBox | null>(null)
  // Note that this gets the bounding box for the entire textbox, which causes the link viewer + changer to render below
  // the input regardless of cursor position.
  // :TODO: (jmtaber129): Get a bounding box that will render the menus closer to the cursor.
  const originCoords = editorRef.current?.editorContentRef.current.getBoundingClientRect()
  if (originCoords) {
    cachedCoordsRef.current = originCoords
  }

  const renderLinkChanger = () => {
    if (!cachedCoordsRef.current) {
      setTimeout(forceUpdate)
      return null
    }

    return (
      editor &&
      linkMenuProps && (
        <EditorLinkChangerTipTap
          text={linkMenuProps.text}
          link={linkMenuProps.href}
          tiptapEditor={editor}
          originCoords={originCoords}
          removeModal={() => {
            setLinkMenuProps(undefined)
          }}
        />
      )
    )
  }

  const renderLinkViewer = () => {
    if (!cachedCoordsRef.current) {
      setTimeout(forceUpdate)
      return null
    }

    const onAddHyperlink = () => {
      if (!editor) {
        return
      }

      const href: string | undefined = editor.getAttributes('link').href
      editor.commands.extendMarkRange('link')

      let {from, to} = editor.view.state.selection
      if (to === from) {
        editor.commands.setTextSelection({to: to - 1, from: from - 1})
        editor.commands.extendMarkRange('link')
        const selection = editor.view.state.selection
        to = selection.to
        from = selection.from
      }
      const text = editor.state.doc.textBetween(from, to, '')
      setSelectedHref(null)
      setLinkMenuProps({text, href: href ?? ''})
    }

    return (
      editor &&
      selectedHref && (
        <EditorLinkViewerTipTap
          href={selectedHref}
          tiptapEditor={editor}
          addHyperlink={onAddHyperlink}
          originCoords={originCoords}
          removeModal={() => {
            setSelectedHref(null)
          }}
        />
      )
    )
  }

  return (
    <StyledEditor>
      {renderLinkChanger()}
      {renderLinkViewer()}
      <EditorContent ref={editorRef} editor={editor} />
    </StyledEditor>
  )
}
export default PromptResponseEditor
