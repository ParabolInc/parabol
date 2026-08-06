import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {InvitationLinkErrorExpired_massInvitation$key} from '../__generated__/InvitationLinkErrorExpired_massInvitation.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {Button} from '../ui/Button/Button'
import hasToken from '../utils/hasToken'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  massInvitation: InvitationLinkErrorExpired_massInvitation$key
}

const InvitationLinkErrorExpired = (props: Props) => {
  const {massInvitation: massInvitationRef} = props
  const massInvitation = useFragment(
    graphql`
      fragment InvitationLinkErrorExpired_massInvitation on MassInvitationPayload {
        teamName
        teamId
      }
    `,
    massInvitationRef
  )
  const {teamName} = massInvitation
  useDocumentTitle(`Token Expired | Invitation Link`, 'Invitation Link')

  const navigate = useNavigate()

  return (
    <InviteDialog>
      <DialogTitle>Invitation Link Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <span className='whitespace-nowrap font-semibold'>{teamName}</span> has
          expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to the team administrator to request a new invitation
        </InvitationDialogCopy>
        <div className='mt-5 flex justify-center'>
          {hasToken() ? (
            <>
              <Button
                variant='primary'
                size='md'
                className='h-10 text-[15px]'
                onClick={() => navigate('/meetings')}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <Button
              variant='primary'
              size='md'
              className='h-10 text-[15px]'
              onClick={() => navigate('/')}
            >
              Sign In
            </Button>
          )}
        </div>
      </DialogContent>
    </InviteDialog>
  )
}

export default InvitationLinkErrorExpired
