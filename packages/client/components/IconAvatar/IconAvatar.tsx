import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import Icon from '../Icon'
import {ICON_SIZE} from '../../styles/typographyV2'

const IconAvatarRoot = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.BACKGROUND_PRIMARY_70,
  borderRadius: '100%',
  color: '#FFFFFF',
  display: 'flex',
  fontSize: ICON_SIZE.MD18,
  height: 32,
  justifyContent: 'center',
  textAlign: 'center',
  width: 32
})

const StyledIcon = styled(Icon)({
  fontSize: 'inherit'
})

interface Props {
  children: ReactNode
}

export default ({children}: Props) => (
  <IconAvatarRoot>
    <StyledIcon>{children}</StyledIcon>
  </IconAvatarRoot>
)
