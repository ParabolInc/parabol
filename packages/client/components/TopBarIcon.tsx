import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '../styles/paletteV2'

const ButtonIcon = styled(Icon)({})

const Button = styled(PlainButton)({
  cursor: 'pointer',
  padding: '16px 8px',
  position: 'relative'
})

const Badge = styled('div')({
  borderRadius: 10,
  top: 15,
  position: 'absolute',
  left: 22,
  background: PALETTE.BACKGROUND_PINK,
  border: `1px solid ${PALETTE.PRIMARY_MAIN}`,
  // +1 for borders
  width: 9,
  height: 9
})

interface Props {
  icon: string
  onClick: () => void
  hasBadge: boolean
}

const TopBarIcon = (props: Props) => {
  const {icon, hasBadge, onClick} = props
  return (
    <Button onClick={onClick}>
      <ButtonIcon>{icon}</ButtonIcon>
      {hasBadge && <Badge />}
    </Button>
  )
}

export default TopBarIcon
