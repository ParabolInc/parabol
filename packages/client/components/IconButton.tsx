import styled from '@emotion/styled'
import {CancelOutlined, Close, Menu} from '@mui/icons-material'
import React from 'react'
import LinkButton, {LinkButtonProps} from './LinkButton'

const StyledButton = styled(LinkButton)({outline: 0})

interface Props extends LinkButtonProps {
  icon: string
  iconLarge?: boolean
}

const StyledIcon = styled('div')({
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const notIconLargeStyles = {
  height: 18,
  width: 18
}

const CancelOutlinedIcon = styled(CancelOutlined)<{iconLarge?: boolean}>((iconLarge) =>
  !iconLarge ? notIconLargeStyles : undefined
)
const CloseIcon = styled(Close)<{iconLarge?: boolean}>((iconLarge) =>
  !iconLarge ? notIconLargeStyles : undefined
)
const MenuIcon = styled(Menu)<{iconLarge?: boolean}>((iconLarge) =>
  !iconLarge ? notIconLargeStyles : undefined
)

const IconButton = (props: Props) => {
  const {icon, iconLarge} = props

  return (
    <StyledButton {...props} type='button'>
      <StyledIcon>
        {
          {
            cancel: <CancelOutlinedIcon iconLarge={iconLarge} />,
            close: <CloseIcon iconLarge={iconLarge} />,
            menu: <MenuIcon iconLarge={iconLarge} />
          }[icon]
        }
      </StyledIcon>
    </StyledButton>
  )
}

export default IconButton
