import React from 'react'
import styled from '@emotion/styled'
import DemoCreateAccountPrimaryButton from './DemoCreateAccountPrimaryButton'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import DialogContainer from './DialogContainer'
import hasToken from '../utils/hasToken'

const StyledDialogContainer = styled(DialogContainer)({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 16px 32px',
  width: 500
})

const StyledCopy = styled('p')({
  fontSize: 16,
  lineHeight: 1.5,
  margin: '16px 0 24px',
  padding: 0,
  textAlign: 'center'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_BLUE,
  fontSize: ICON_SIZE.MD48
})

const AddTeamMemberModalDemo = () => {
  const copy = hasToken()
    ? 'Invite your teammates to a team and kick off a real Retro!'
    : 'Sign up, invite your teammates, and kick off a real Retro!'
  return (
    <StyledDialogContainer>
      <StyledIcon>group_add</StyledIcon>
      <StyledCopy>{copy}</StyledCopy>
      <DemoCreateAccountPrimaryButton />
    </StyledDialogContainer>
  )
}

export default AddTeamMemberModalDemo
