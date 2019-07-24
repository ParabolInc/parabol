import IconLabel from '../IconLabel'
import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import FloatingActionButton from '../FloatingActionButton'
import {meetingHelpWithBottomBar} from '../../styles/meeting'

const StyledButton = styled(FloatingActionButton)<Props>(({floatAboveBottomBar}) => ({
  bottom: floatAboveBottomBar ? meetingHelpWithBottomBar : '1.25rem',
  height: '2rem',
  paddingLeft: 0,
  paddingRight: 0,
  position: 'fixed',
  right: '1.25rem',
  width: '2rem',
  zIndex: 200
}))

interface Props {
  floatAboveBottomBar: boolean
  onClick: () => void
  onMouseEnter: () => void
}

const HelpMenuToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  return (
    <StyledButton palette='white' {...props} ref={ref}>
      <IconLabel icon='help_outline' />
    </StyledButton>
  )
})

export default HelpMenuToggle
