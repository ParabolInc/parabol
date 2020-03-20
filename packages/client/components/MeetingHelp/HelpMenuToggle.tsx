import IconLabel from '../IconLabel'
import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import FloatingActionButton from '../FloatingActionButton'
import {Breakpoint, ZIndex} from '../../types/constEnums'
import makeMinWidthMediaQuery from '../../utils/makeMinWidthMediaQuery'

const StyledButton = styled(FloatingActionButton)({
  bottom: 16,
  height: 32,
  paddingLeft: 0,
  paddingRight: 0,
  position: 'absolute',
  right: 16,
  width: 32,
  zIndex: ZIndex.FAB,
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    bottom: 20,
    right: 20
  }
})

interface Props {
  onClick: () => void
  onMouseEnter: () => void
}

const HelpMenuToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  return (
    <StyledButton dataCy='help-menu-toggle' palette='white' {...props} ref={ref}>
      <IconLabel icon='help_outline' />
    </StyledButton>
  )
})

export default HelpMenuToggle
