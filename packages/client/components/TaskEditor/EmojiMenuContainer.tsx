import {EditorState} from 'draft-js'
import React, {Ref, useEffect} from 'react'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'
import lazyPreload from '../../utils/lazyPreload'

interface Props {
  originCoords: ClientRect
  onSelectEmoji: (emoji: string, editorState: EditorState) => void
  query: string
  menuRef: Ref<any>
  editorState: EditorState
  removeModal: () => void
}

const EmojiMenu = lazyPreload(() => import(/* webpackChunkName: 'EmojiMenu' */ '../EmojiMenu'))

const EmojiMenuContainer = (props: Props) => {
  const {originCoords, removeModal, onSelectEmoji, query, menuRef, editorState} = props
  const {menuProps, menuPortal, togglePortal} = useMenu(MenuPosition.UPPER_LEFT, {
    originCoords,
    onClose: removeModal
  })

  useEffect(togglePortal, [])
  return menuPortal(
    <EmojiMenu
      menuProps={menuProps}
      onSelectEmoji={onSelectEmoji}
      query={query}
      menuRef={menuRef}
      editorState={editorState}
    />
  )
}

export default EmojiMenuContainer
