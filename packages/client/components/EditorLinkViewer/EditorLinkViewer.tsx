import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'
import textOverflow from '../../styles/helpers/textOverflow'
import {PALETTE} from '../../styles/paletteV3'
import {BBox} from '../../types/animations'
import dontTellDraft from '../../utils/draftjs/dontTellDraft'
import FlatButton from '../FlatButton'

const UrlSpan = styled('span')({
  ...textOverflow,
  alignItems: 'center',
  borderRight: `1px solid ${PALETTE.GRAPE_700}`,
  display: 'flex',
  flexShrink: 2,
  fontSize: 14,
  lineHeight: '32px',
  marginRight: 8,
  padding: '0 12px'
})

const LinkText = styled('a')({
  ...textOverflow,
  marginRight: 8,
  maxWidth: 320
})

const MenuStyles = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 20,
  padding: '0 8px'
})

interface Props {
  href: string
  addHyperlink: () => void
  originCoords: BBox
  onRemove: () => void
  removeModal: () => void
}

const EditorLinkViewer = (props: Props) => {
  const {href, addHyperlink, removeModal, onRemove, originCoords} = props
  const {menuPortal, openPortal} = useMenu(MenuPosition.UPPER_LEFT, {
    isDropdown: true,
    originCoords
  })
  useEffect(openPortal, [])
  const handleRemove = () => {
    onRemove()
    removeModal()
  }

  const changeLink = () => {
    addHyperlink()
  }

  return menuPortal(
    <MenuStyles onMouseDown={dontTellDraft}>
      <UrlSpan>
        <LinkText href={href} rel='noopener noreferrer' target='_blank'>
          {href}
        </LinkText>
      </UrlSpan>
      <FlatButton onClick={changeLink} palette='mid'>
        {'Change'}
      </FlatButton>
      <FlatButton onClick={handleRemove} palette='mid'>
        {'Remove'}
      </FlatButton>
    </MenuStyles>
  )
}

export default EditorLinkViewer
