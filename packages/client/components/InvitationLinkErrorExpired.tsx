import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useRouter from '../hooks/useRouter'
import PushInvitationMutation from '../mutations/PushInvitationMutation'
import hasToken from '../utils/hasToken'
import {InvitationLinkErrorExpired_massInvitation} from '../__generated__/InvitationLinkErrorExpired_massInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import FlatPrimaryButton from './FlatPrimaryButton'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import LinkButton from './LinkButton'

interface Props {
  massInvitation: InvitationLinkErrorExpired_massInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const DialogActions = styled('div')({
  marginTop: 20,
  display: 'flex',
  justifyContent: 'center'
})

const DashboardButton = styled(LinkButton)({
  fontWeight: 600,
  width: '50%'
})

const InvitationLinkErrorExpired = (props: Props) => {
  const {massInvitation} = props
  const {teamName, teamId} = massInvitation
  useDocumentTitle(`Token Expired | Invitation Link`, 'Invitation Link')

  const {history} = useRouter()
  const atmosphere = useAtmosphere()

  const requestInvite = () => {
    if (teamId) {
      PushInvitationMutation(atmosphere, {teamId})
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'inviteRequested',
        message: 'Invite requested',
        autoDismiss: 5,
        showDismissButton: true
      })
    }
  }

  return (
    <InviteDialog>
      <DialogTitle>Invitation Link Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <TeamName>{teamName}</TeamName> has expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          {hasToken()
            ? `Request a new invitation or reach out to the team administrator.`
            : `Sign in to request a new invitation or reach out to the team administrator.`}
        </InvitationDialogCopy>
        <DialogActions>
          {hasToken() ? (
            <>
              <FlatPrimaryButton onClick={requestInvite} size='medium'>
                Request Invite
              </FlatPrimaryButton>
              <DashboardButton
                onClick={() => history.push('/meetings')}
                size='medium'
                palette='blue'
              >
                Go to Dashboard
              </DashboardButton>
            </>
          ) : (
            <FlatPrimaryButton onClick={() => history.push('/')} size='medium'>
              Sign In
            </FlatPrimaryButton>
          )}
        </DialogActions>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(InvitationLinkErrorExpired, {
  massInvitation: graphql`
    fragment InvitationLinkErrorExpired_massInvitation on MassInvitationPayload {
      teamName
      teamId
    }
  `
})
