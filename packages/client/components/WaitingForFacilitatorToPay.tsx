import React from 'react'
import styled from '@emotion/styled'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogContainer from './DialogContainer'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import Ellipsis from './Ellipsis/Ellipsis'

const HelpIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD48,
  padding: 24
})

const Container = styled(DialogContainer)({
  alignItems: 'center'
})

const WaitingForFacilitatorToPay = () => {
  return (
    <Container>
      <HelpIcon>live_help</HelpIcon>
      <InvitationDialogCopy>{'Waiting for the facilitator to continue'}<Ellipsis />
      </InvitationDialogCopy>
    </Container>
  )
}

export default WaitingForFacilitatorToPay
