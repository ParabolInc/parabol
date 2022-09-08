import styled from '@emotion/styled'
import 'emoji-mart/css/emoji-mart.css'
import appleEmojis from 'emoji-mart/data/apple.json'
import NimblePicker from 'emoji-mart/dist-modern/components/picker/nimble-picker'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '~/styles/paletteV3'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'

const TallMenu = styled(Menu)({
  maxHeight: 354
})

interface Props {
  onClick: (emoji) => void
  menuProps: MenuProps
}

const ReactjiPicker = (props: Props) => {
  const {menuProps, onClick} = props

  const {t} = useTranslation()

  const {closePortal} = menuProps
  const handleClick = (emoji) => {
    onClick(emoji.id)
    closePortal()
  }
  return (
    <TallMenu ariaLabel={t('ReactjiPicker.PickAReactji')} {...menuProps}>
      <NimblePicker
        set={t('ReactjiPicker.Apple')}
        data={appleEmojis}
        color={PALETTE.SKY_500}
        darkMode={false}
        emoji={''}
        native
        onClick={handleClick}
        showPreview={false}
        showSkinTones={false}
        style={{borderRadius: 4}}
      />
    </TallMenu>
  )
}

export default ReactjiPicker
