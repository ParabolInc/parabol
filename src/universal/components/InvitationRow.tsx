import React from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import {Dispatch} from 'redux'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import UserRowActionsBlock from 'universal/components/UserRowActionsBlock'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import UserRowFlatButton from 'universal/modules/teamDashboard/components/TeamSettings/UserRowFlatButton'
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck'
import CancelTeamInviteMutation from 'universal/mutations/CancelTeamInviteMutation'
import ResendTeamInviteMutation from 'universal/mutations/ResendTeamInviteMutation'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import fromNow from 'universal/utils/fromNow'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import {InvitationRow_invitation} from '__generated__/InvitationRow_invitation.graphql'

interface Props extends WithAtmosphereProps, WithMutationProps {
  dispatch: Dispatch<any>
  invitation: InvitationRow_invitation
  teamId: string
}

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
        <img alt="" src={defaultUserAvatar} />
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
  (connect() as any)(withAtmosphere(withMutationProps(InvitationRow))),
  graphql`
    fragment InvitationRow_invitation on Invitation {
      invitationId: id
      email
      updatedAt
    }
  `
)
