import {EditorProps, EditorState} from 'draft-js'
import React, {ReactNode, useRef, useState} from 'react'
import {SetEditorState} from '../../types/draft'
import {autoCompleteEmoji} from '../../utils/draftjs/completeEntity'
import getDraftCoords from '../../utils/getDraftCoords'
import EmojiMenuContainer from './EmojiMenuContainer'
import getAnchorLocation from './getAnchorLocation'
import getWordAt from './getWordAt'

type Handlers = Pick<EditorProps, 'keyBindingFn' | 'onChange'> & {
  renderModal?: () => ReactNode | null
  removeModal?: () => void
}

interface MenuRef {
  handleKeyDown: (e: React.KeyboardEvent<any>) => 'handled' | 'not-handled'
}

const useEmojis = (
  editorState: EditorState,
  setEditorState: SetEditorState,
  handlers: Handlers
) => {
  const {keyBindingFn, onChange, renderModal, removeModal} = handlers
  const menuRef = useRef<MenuRef>(null)
  const cachedCoordsRef = useRef<ClientRect | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedEditorState, setFocusedEditorState] = useState<EditorState>(editorState)
  if (focusedEditorState !== editorState && editorState.getSelection().getHasFocus()) {
    setFocusedEditorState(editorState)
  }

  const handleKeyBindingFn: Handlers['keyBindingFn'] = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) return result
    }
    if (menuRef.current) {
      const handled = menuRef.current.handleKeyDown(e)
      if (handled) return handled
    }
    return null
  }
  const onSelectEmoji = (emoji: string) => {
    const nextEditorState = autoCompleteEmoji(focusedEditorState, emoji)
    setEditorState(nextEditorState)
  }

  const onRemoveModal = () => {
    setIsOpen(false)
    setQuery('')
  }

  const handleChange = (editorState: EditorState) => {
    if (onChange) {
      onChange(editorState)
    }
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const blockText = block.getText()
    const entityKey = block.getEntityAt(anchorOffset - 1)
    const {word} = getWordAt(blockText, anchorOffset - 1)

    const inASuggestion = word && !entityKey && word[0] === ':'
    if (inASuggestion) {
      setIsOpen(true)
      setQuery(word.slice(1))
    } else if (isOpen) {
      onRemoveModal()
    }
  }

  const onRenderModal = () => {
    cachedCoordsRef.current = getDraftCoords() || cachedCoordsRef.current
    return (
      <EmojiMenuContainer
        removeModal={onRemoveModal}
        onSelectEmoji={onSelectEmoji}
        query={query}
        menuRef={menuRef}
        originCoords={cachedCoordsRef.current!}
      />
    )
  }
  return {
    onChange: handleChange,
    renderModal: isOpen ? onRenderModal : renderModal,
    removeModal: isOpen ? onRemoveModal : removeModal,
    keyBindingFn: isOpen ? handleKeyBindingFn : keyBindingFn
  }
}

export default useEmojis
