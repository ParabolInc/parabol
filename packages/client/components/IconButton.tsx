import styled from '@emotion/styled'
import {CancelOutlined, Close, Menu} from '@mui/icons-material'
import React from 'react'
import LinkButton, {LinkButtonProps} from './LinkButton'

const StyledButton = styled(LinkButton)({outline: 0})

interface Props extends LinkButtonProps {
  icon: string
  iconLarge?: boolean
}

const StyledIcon = styled('div')<{iconLarge: boolean | undefined}>(({iconLarge}) => ({
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: iconLarge ? 24 : 18,
  width: iconLarge ? 24 : 18,
  '& svg': {
    fontSize: iconLarge ? 24 : 18
  }
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
