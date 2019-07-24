import {EditorState} from 'draft-js'
import React, {Ref, useEffect} from 'react'
import {BBox} from '../../types/animations'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'
import lazyPreload from '../../utils/lazyPreload'

interface Props {
  originCoords: BBox
  menuItemClickFactory: (emoji: string, editorState: EditorState | null) => () => void
  query: string
  menuRef: Ref<any>
  editorState: EditorState
  removeModal: () => void
}

const EmojiMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'EmojiMenu' */ 'universal/components/EmojiMenu')
)

const EmojiMenuContainer = (props: Props) => {
  const {originCoords, removeModal, menuItemClickFactory, query, menuRef, editorState} = props
  const {menuProps, menuPortal, togglePortal} = useMenu(MenuPosition.UPPER_LEFT, {
    originCoords,
    onClose: removeModal
  })
  useEffect(togglePortal, [])
  return menuPortal(
    <EmojiMenu
      menuProps={menuProps}
      menuItemClickFactory={menuItemClickFactory}
      query={query}
      menuRef={menuRef}
      editorState={editorState}
    />
  )
}

export default EmojiMenuContainer
