import * as Sentry from '@sentry/browser'
import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '../__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import React, {useState} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import LoginMutation from '../mutations/LoginMutation'
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
import Auth0ClientManager from '../utils/Auth0ClientManager'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import useMutationProps from '../hooks/useMutationProps'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
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
  const atmosphere = useAtmosphere()
  const {history, match} = useRouter<{token: string}>()
  const {params} = match
  const {token: invitationToken} = params
  const {submitting, submitMutation, onError, onCompleted, error} = useMutationProps()
  const {verifiedInvitation} = props
  const {meetingType, teamInvitation, teamName} = verifiedInvitation

  const onOAuth = async () => {
    if (!teamInvitation) return
    const {email} = teamInvitation
    submitMutation()
    const manager = new Auth0ClientManager()
    let res
    try {
      res = await manager.loginWithGoogle(email)
    } catch (e) {
      onError(e)
      Sentry.captureException(e)
      return
    }
    onCompleted()
    const {idToken} = res
    LoginMutation(atmosphere, {auth0Token: idToken, invitationToken}, {history})
  }

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
          <GoogleOAuthButtonBlock
            label='Sign up with Google'
            onClick={onOAuth}
            isError={!!error}
            submitting={!!submitting}
          />
          {isEmailFallback ? (
            <HorizontalSeparator margin='1rem 0 0' text='or' />
          ) : (
            <UseEmailFallback onClick={useEmail}>Sign up without Google</UseEmailFallback>
          )}
          {isEmailFallback && <EmailPasswordAuthForm email={email} />}
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
