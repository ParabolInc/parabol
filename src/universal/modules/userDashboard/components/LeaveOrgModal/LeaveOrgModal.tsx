import React from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DialogContainer from 'universal/components/DialogContainer'
import DialogContent from 'universal/components/DialogContent'
import DialogTitle from 'universal/components/DialogTitle'
import IconLabel from 'universal/components/IconLabel'
import PrimaryButton from 'universal/components/PrimaryButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveOrgUserMutation from 'universal/mutations/RemoveOrgUserMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
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
