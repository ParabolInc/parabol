import styled from '@emotion/styled'
import {LiveHelp} from '@mui/icons-material'
import React from 'react'
import DialogContainer from './DialogContainer'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationDialogCopy from './InvitationDialogCopy'

const HelpIcon = styled(LiveHelp)({
  height: 48,
  width: 48,
  margin: 24
})

const Container = styled(DialogContainer)({
  alignItems: 'center',
  paddingBottom: 24,
  userSelect: 'none'
})

interface Props {
  facilitatorName: string
}

const WaitingForFacilitatorToPay = (props: Props) => {
  const {facilitatorName} = props
  return (
    <Container>
      <HelpIcon />
      <InvitationDialogCopy>
        {'Waiting for '}
        <b>{facilitatorName}</b>
        {' to continue'}
        <Ellipsis />
      </InvitationDialogCopy>
    </Container>
  )
}

export default WaitingForFacilitatorToPay
