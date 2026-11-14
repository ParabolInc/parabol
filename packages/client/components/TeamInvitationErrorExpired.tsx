import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamInvitationErrorExpired_verifiedInvitation$key} from '../__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation$key
}

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation: verifiedInvitationRef} = props
  const verifiedInvitation = useFragment(
    graphql`
      fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
        teamName
        inviterName
        inviterEmail
      }
    `,
    verifiedInvitationRef
  )
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  useDocumentTitle(`Token Expired | Team Invitation`, 'Team Invitation')
  return (
    <InviteDialog>
      <DialogTitle>Invitation Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <span className='whitespace-nowrap font-semibold'>{teamName}</span> has
          expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to {inviterName} at{' '}
          <a
            className='text-accent'
            href={`mailto:${inviterEmail}`}
            title={`Email ${inviterEmail}`}
          >
            {inviterEmail}
          </a>
        </InvitationDialogCopy>
        <InvitationDialogCopy>to request a new one</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorExpired
