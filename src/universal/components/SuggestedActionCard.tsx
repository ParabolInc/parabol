import React, {ReactNode} from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {buttonShadow, cardShadow} from 'universal/styles/elevation'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import SuggestedActionBackground from './SuggestedActionBackground'

interface Props {
  backgroundColor: string
  children: ReactNode
  iconName: string
}

const Surface = styled('div')({
  alignItems: 'center',
  background: '#fff',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: '100%'
})

const CancelIcon = styled(Icon)({
  color: PALETTE.TEXT.MAIN,
  position: 'absolute',
  right: 8,
  top: 8,
  opacity: 0.7,
  '&:hover': {
    opacity: 1
  }
})

const FloatingSealIcon = styled(Icon)({
  color: PALETTE.PRIMARY.MAIN,
  background: PALETTE.BACKGROUND.MAIN_DARKENED,
  borderRadius: '100%',
  boxShadow: buttonShadow,
  padding: 8,
  position: 'absolute',
  fontSize: ICON_SIZE.MD36,
  top: 100,
  userSelect: 'none'
})

const SuggestedActionCard = (props: Props) => {
  const {backgroundColor, children, iconName} = props
  return (
    <Surface>
      <SuggestedActionBackground backgroundColor={backgroundColor} />
      {children}
      <PlainButton>
        <CancelIcon>cancel</CancelIcon>
      </PlainButton>
      <FloatingSealIcon>{iconName}</FloatingSealIcon>
    </Surface>
  )
}

export default SuggestedActionCard
