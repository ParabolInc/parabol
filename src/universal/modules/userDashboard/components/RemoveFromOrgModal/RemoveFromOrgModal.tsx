import React from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DialogContent from 'universal/components/DialogContent'
import DialogHeading from 'universal/components/DialogHeading'
import IconLabel from 'universal/components/IconLabel'
import PrimaryButton from 'universal/components/PrimaryButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveOrgUserMutation from 'universal/mutations/RemoveOrgUserMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import TeamManagementModalBoundary from '../../../teamDashboard/components/PromoteTeamMemberModal/TeamManagementModalBoundary'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  orgId: string
  userId: string
  preferredName: string
}

const ModalBoundary = styled(TeamManagementModalBoundary)({
  width: '400'
})

const RemoveFromOrgModal = (props: Props) => {
  const {
    atmosphere,
    history,
    onError,
    onCompleted,
    submitting,
    submitMutation,
    orgId,
    preferredName,
    userId
  } = props
  const handleClick = () => {
    submitMutation()
    RemoveOrgUserMutation(atmosphere, {orgId, userId}, {history}, onError, onCompleted)
  }
  return (
    <ModalBoundary>
      <DialogHeading>{'Are you sure?'}</DialogHeading>
      <DialogContent>
        {`This will remove ${preferredName} from the organization. Any outstanding tasks will be given
        to the team leads. Any time remaining on their subscription will be refunded on the next
        invoice.`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </ModalBoundary>
  )
}

export default withRouter(withAtmosphere(withMutationProps(RemoveFromOrgModal)))
