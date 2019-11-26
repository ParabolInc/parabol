import React from 'react'
import styled from '@emotion/styled'
import DemoCreateAccountPrimaryButton from './DemoCreateAccountPrimaryButton'
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

const Illustration = styled('img')({
  display: 'block',
  margin: '16px auto 0',
  maxWidth: 320,
  width: '100%'
})

const AddTeamMemberModalDemo = () => {
  const copy = hasToken()
    ? 'Invite your teammates to a team and kick off a real Retro!'
    : 'Sign up, invite your teammates, and kick off a real Retro!'
  const imageSrc = `${__STATIC_IMAGES__}/illustrations/illus-momentum.png`
  return (
    <StyledDialogContainer>
      <Illustration alt='' src={imageSrc} />
      <StyledCopy>{copy}</StyledCopy>
      <DemoCreateAccountPrimaryButton />
    </StyledDialogContainer>
  )
}

export default AddTeamMemberModalDemo
