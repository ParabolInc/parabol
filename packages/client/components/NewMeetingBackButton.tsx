import React from 'react'
import FloatingActionButton from './FloatingActionButton'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV2'

const BackButton = styled(FloatingActionButton)({
  background: PALETTE.BACKGROUND_MAIN,
  height: ICON_SIZE.MD40,
  left: 32,
  padding: 0,
  position: 'absolute',
  top: 32,
  width: ICON_SIZE.MD40
})

const BackIcon = styled(Icon)({})

const NewMeetingBackButton = () => {
  return (
    <BackButton>
      <BackIcon>arrow_back</BackIcon>
    </BackButton>
  )
}

export default NewMeetingBackButton
