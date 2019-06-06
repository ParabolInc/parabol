import React from 'react'
import styled from 'react-emotion'
import CreateAccountPrimaryButton from 'universal/components/CreateAccountPrimaryButton'
import Icon from 'universal/components/Icon'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE} from 'universal/styles/typographyV2'

const StyledContainer = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 16px 32px'
})

const StyledCopy = styled('p')({
  fontSize: 16,
  lineHeight: 1.5,
  margin: '16px 0 24px',
  padding: 0,
  textAlign: 'center'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT.BLUE,
  fontSize: ICON_SIZE.MD48
})

const AddTeamMemberModalDemoContent = () => (
  <StyledContainer>
    <StyledIcon>group_add</StyledIcon>
    <StyledCopy>Sign up, invite your teammates, and kick off your own Retro!</StyledCopy>
    <CreateAccountPrimaryButton />
  </StyledContainer>
)

export default AddTeamMemberModalDemoContent
