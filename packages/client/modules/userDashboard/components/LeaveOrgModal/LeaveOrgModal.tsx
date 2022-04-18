import styled from '@emotion/styled'
import React from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import RemoveOrgUserMutation from '../../../../mutations/RemoveOrgUserMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps {
  orgId: string
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto'
})

const LeaveOrgModal = (props: Props) => {
  const {atmosphere, history, submitting, submitMutation, onCompleted, onError, orgId} = props
  const handleClick = () => {
    if (submitting) return
    submitMutation()
    RemoveOrgUserMutation(
      atmosphere,
      {orgId, userId: atmosphere.viewerId},
      {history},
      onError,
      onCompleted
    )
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{'Are you sure?'}</DialogTitle>
      <DialogContent>
        {'This will remove you from the organization and all teams under it! '}
        <br />
        {'To undo it, you’ll have to ask another Billing Leader to re-add you.'}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label='Leave the organization' />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default withRouter(withAtmosphere(withMutationProps(LeaveOrgModal)))
