import IconLabel from 'universal/components/IconLabel'
import React, {forwardRef} from 'react'
import styled from 'react-emotion'
import FloatingActionButton from 'universal/components/FloatingActionButton'
import {meetingHelpWithBottomBar} from 'universal/styles/meeting'

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

const HelpMenuToggle = forwardRef((props: Props, ref: any) => {
  return (
    <StyledButton palette='white' {...props} innerRef={ref}>
      <IconLabel icon='help_outline' />
    </StyledButton>
  )
})

export default HelpMenuToggle
