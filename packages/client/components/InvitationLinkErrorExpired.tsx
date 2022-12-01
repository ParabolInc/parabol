import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useRouter from '../hooks/useRouter'
import hasToken from '../utils/hasToken'
import {InvitationLinkErrorExpired_massInvitation} from '../__generated__/InvitationLinkErrorExpired_massInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import FlatPrimaryButton from './FlatPrimaryButton'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

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

const InvitationLinkErrorExpired = (props: Props) => {
  const {massInvitation} = props
  const {teamName} = massInvitation
  useDocumentTitle(`Token Expired | Invitation Link`, 'Invitation Link')

  const {history} = useRouter()

  return (
    <InviteDialog>
      <DialogTitle>Invitation Link Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <TeamName>{teamName}</TeamName> has expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to the team administrator to request a new invitation
        </InvitationDialogCopy>
        <DialogActions>
          {hasToken() ? (
            <>
              <FlatPrimaryButton onClick={() => history.push('/meetings')} size='medium'>
                Go to Dashboard
              </FlatPrimaryButton>
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
