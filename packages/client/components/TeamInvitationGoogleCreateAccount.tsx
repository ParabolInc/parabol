import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '../__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import React, {useState} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from '../styles/paletteV2'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import PlainButton from './PlainButton/PlainButton'
import HorizontalSeparator from './HorizontalSeparator/HorizontalSeparator'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import useRouter from '../hooks/useRouter'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  invitationToken: string
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const StyledContent = styled(DialogContent)({
  paddingLeft: 0,
  paddingRight: 0
})

const CopyMargins = styled('div')({
  padding: '0 1.5rem'
})

const UseEmailFallback = styled(PlainButton)({
  margin: '1rem',
  color: PALETTE.LINK_BLUE
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationGoogleCreateAccount = (props: Props) => {
  const [isEmailFallback, setIsEmailFallback] = useState(false)
  const {match} = useRouter<{token: string}>()
  const {params} = match
  const {token: invitationToken} = params
  const {verifiedInvitation} = props
  const {meetingType, teamInvitation, teamName} = verifiedInvitation

  const useEmail = () => {
    setIsEmailFallback(true)
  }

  useDocumentTitle(`Sign up with Google | Team Invitation`)
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <DialogTitle>
        {meetingType ? `Join ${meetingTypeToLabel[meetingType]} Meeting` : 'Join Team'}
      </DialogTitle>
      <StyledContent>
        <CopyMargins>
          <InvitationDialogCopy>It looks like your email is hosted by Google.</InvitationDialogCopy>
          <InvitationDialogCopy>
            Tap below for immediate access
            {meetingType ? ' to the team meeting for: ' : ' to your team: '}
            <TeamName>{teamName}</TeamName>
          </InvitationDialogCopy>
        </CopyMargins>
        <InvitationCenteredCopy>
          <GoogleOAuthButtonBlock isCreate loginHint={email} invitationToken={invitationToken} />
          {isEmailFallback ? (
            <HorizontalSeparator margin='1rem 0 0' text='or' />
          ) : (
            <UseEmailFallback onClick={useEmail}>Sign up without Google</UseEmailFallback>
          )}
          {isEmailFallback && (
            <EmailPasswordAuthForm email={email} invitationToken={invitationToken} />
          )}
        </InvitationCenteredCopy>
        <AuthPrivacyFooter />
      </StyledContent>
    </StyledDialog>
  )
}

export default createFragmentContainer(TeamInvitationGoogleCreateAccount, {
  verifiedInvitation: graphql`
    fragment TeamInvitationGoogleCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      meetingType
      teamInvitation {
        email
      }
      teamName
    }
  `
})
