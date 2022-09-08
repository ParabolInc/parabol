import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import React, {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../../styles/paletteV3'

const Content = styled('div')({
  fontSize: 13,
  lineHeight: 1.5384615385,
  position: 'relative',
  padding: '12px 16px',
  width: 272
})

const MenuClose = styled('div')({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  position: 'absolute',
  height: 18,
  width: 18,
  right: 4,
  top: -4,
  '&:hover': {
    opacity: 0.5
  }
})

const CloseIcon = styled(Close)({
  height: 18,
  width: 18
})

interface Props {
  children: ReactNode
  closePortal: () => void
}

const HelpMenuContent = (props: Props) => {
  const {children, closePortal} = props

  const {t} = useTranslation()

  return (
    <Content>
      <MenuClose
        data-cy='help-menu-close'
        onClick={closePortal}
        title={t('HelpMenuContent.CloseHelpMenu')}
      >
        <CloseIcon />
      </MenuClose>
      {children}
    </Content>
  )
}

export default HelpMenuContent
