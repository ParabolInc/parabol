import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useParams} from 'react-router'
import type {TeamInvitationGoogleCreateAccount_verifiedInvitation$key} from '../__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import HorizontalSeparator from './HorizontalSeparator/HorizontalSeparator'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  invitationToken: string
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation$key
}

const TeamInvitationGoogleCreateAccount = (props: Props) => {
  const [isEmailFallback, setIsEmailFallback] = useState(false)
  const {token} = useParams()
  const invitationToken = token!
  const {verifiedInvitation: verifiedInvitationRef} = props
  const verifiedInvitation = useFragment(
    graphql`
      fragment TeamInvitationGoogleCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
        meetingName
        teamInvitation {
          email
        }
        teamName
      }
    `,
    verifiedInvitationRef
  )
  const {meetingName, teamInvitation, teamName} = verifiedInvitation

  const useEmail = () => {
    setIsEmailFallback(true)
  }

  useDocumentTitle(`Sign up with Google | Team Invitation`, 'Team Invitation')
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <InviteDialog className='max-w-[356px]'>
      <DialogTitle>{meetingName ? `Join ${meetingName}` : 'Join Team'}</DialogTitle>
      <DialogContent className='px-0'>
        <div className='px-6'>
          <InvitationDialogCopy>It looks like your email is hosted by Google.</InvitationDialogCopy>
          <InvitationDialogCopy>
            Tap below for immediate access
            {meetingName ? ' to the team meeting for: ' : ' to your team: '}
            <span className='whitespace-nowrap font-semibold'>{teamName}</span>
          </InvitationDialogCopy>
        </div>
        <InvitationCenteredCopy>
          <GoogleOAuthButtonBlock isCreate loginHint={email} invitationToken={invitationToken} />
          {isEmailFallback ? (
            <HorizontalSeparator margin='1rem 0 0' text='or' />
          ) : (
            <PlainButton className='m-4 text-accent' onClick={useEmail}>
              Sign up without Google
            </PlainButton>
          )}
          {isEmailFallback && (
            <EmailPasswordAuthForm email={email} invitationToken={invitationToken} />
          )}
        </InvitationCenteredCopy>
        <AuthPrivacyFooter />
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationGoogleCreateAccount
