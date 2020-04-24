import React from 'react'
import styled from '@emotion/styled'
import LinkButton, {LinkButtonProps} from './LinkButton'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

const StyledButton = styled(LinkButton)({outline: 0})

const StyledIcon = styled(Icon)<{iconLarge?: boolean}>(({iconLarge}) => ({
  color: 'inherit',
  display: 'block',
  fontSize: iconLarge ? ICON_SIZE.MD24 : ICON_SIZE.MD18
}))

interface Props extends LinkButtonProps {
  icon: string
  iconLarge?: boolean
}

const IconButton = (props: Props) => {
  const {icon, iconLarge} = props
  return (
    <StyledButton {...props} type='button'>
      <StyledIcon iconLarge={iconLarge}>{icon}</StyledIcon>
    </StyledButton>
  )
}

export default IconButton
