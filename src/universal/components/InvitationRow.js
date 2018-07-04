// @flow
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import React from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import UserRowActionsBlock from 'universal/components/UserRowActionsBlock'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import UserRowFlatButton from 'universal/modules/teamDashboard/components/TeamSettings/UserRowFlatButton'
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck'
import CancelTeamInviteMutation from 'universal/mutations/CancelTeamInviteMutation'
import ResendTeamInviteMutation from 'universal/mutations/ResendTeamInviteMutation'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import fromNow from 'universal/utils/fromNow'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {InvitationRow_invitation as Invitation} from './__generated__/InvitationRow_invitation.graphql'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'

type Props = {|
  invitation: Invitation,
  teamId: string,
  ...MutationProps
|}

const InvitationRow = (props: Props) => {
  const {
    atmosphere,
    onError,
    onCompleted,
    submitMutation,
    dispatch,
    invitation,
    submitting,
    teamId
  } = props
  const {invitationId, email, updatedAt} = invitation

  const resend = () => {
    if (submitting) return
    submitMutation()
    const onResendCompleted = () => {
      dispatch(
        showSuccess({
          title: 'Invitation sent!',
          message: 'We sent your friend a nice little reminder'
        })
      )
      onCompleted()
    }
    ResendTeamInviteMutation(atmosphere, invitationId, onError, onResendCompleted)
  }
  const cancel = () => {
    if (submitting) return
    submitMutation()
    CancelTeamInviteMutation(atmosphere, invitationId, teamId, onError, onCompleted)
  }
  return (
    <Row>
      <div>
        <img alt='' src={defaultUserAvatar} />
      </div>
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{email}</RowInfoHeading>
        </RowInfoHeader>
        <RowInfoCopy useHintCopy>{`Invited ${fromNow(updatedAt)}`}</RowInfoCopy>
      </RowInfo>
      <RowActions>
        <UserRowActionsBlock>
          <UserRowFlatButton onClick={resend}>{'Resend Invitation'}</UserRowFlatButton>
          <UserRowFlatButton onClick={cancel}>{'Cancel Invitation'}</UserRowFlatButton>
        </UserRowActionsBlock>
      </RowActions>
    </Row>
  )
}

export default createFragmentContainer(
  connect()(withAtmosphere(withMutationProps(InvitationRow))),
  graphql`
    fragment InvitationRow_invitation on Invitation {
      invitationId: id
      email
      updatedAt
    }
  `
)
