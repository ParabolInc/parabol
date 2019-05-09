import {PromoteTeamMemberModal_teamMember} from '__generated__/PromoteTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import DialogTitle from 'universal/components/DialogTitle'
import DialogContent from 'universal/components/DialogContent'
import DialogContainer from 'universal/components/DialogContainer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import PromoteToTeamLeadMutation from 'universal/mutations/PromoteToTeamLeadMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

const StyledDialogContainer = styled(DialogContainer)({
  width: 420
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal: () => void
  teamMember: PromoteTeamMemberModal_teamMember
}
const PromoteTeamMemberModal = (props: Props) => {
  const {
    atmosphere,
    closePortal,
    submitMutation,
    submitting,
    onError,
    onCompleted,
    teamMember
  } = props
  const {preferredName, teamMemberId} = teamMember
  const handleClick = () => {
    submitMutation()
    PromoteToTeamLeadMutation(atmosphere, teamMemberId, onError, onCompleted)
    closePortal()
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{'Are you sure?'}</DialogTitle>
      <DialogContent>
        {`You will be removed as the team leader and promote ${preferredName}. You will no longer be able to change team membership. This cannot be undone!`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Yes, promote ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(PromoteTeamMemberModal)),
  graphql`
    fragment PromoteTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
)
