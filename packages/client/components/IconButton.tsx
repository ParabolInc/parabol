import styled from '@emotion/styled'
import React from 'react'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'
import LinkButton, {LinkButtonProps} from './LinkButton'

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
