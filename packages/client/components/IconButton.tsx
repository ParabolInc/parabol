import styled from '@emotion/styled'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import Close from '@mui/icons-material/Close'
import Menu from '@mui/icons-material/Menu'
import React from 'react'
import {ICON_SIZE} from '../styles/typographyV2'
import LinkButton, {LinkButtonProps} from './LinkButton'

const StyledButton = styled(LinkButton)({outline: 0})

interface Props extends LinkButtonProps {
  icon: string
  iconLarge?: boolean
}

const StyledIcon = styled('div')<{iconLarge?: boolean}>(({iconLarge}) => ({
  color: 'inherit',
  display: 'block',
  fontSize: iconLarge ? ICON_SIZE.MD24 : ICON_SIZE.MD18
}))

const IconButton = (props: Props) => {
  const {icon, iconLarge} = props

  return (
    <StyledButton {...props} type='button'>
      <StyledIcon iconLarge={iconLarge}>
        {
          {
            cancel: <CancelOutlined />,
            close: <Close />,
            menu: <Menu />
          }[icon]
        }
      </StyledIcon>
    </StyledButton>
  )
}

export default IconButton
