import {RemoveTeamMemberModal_teamMember} from '__generated__/RemoveTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import DialogHeading from 'universal/components/DialogHeading'
import DialogContent from 'universal/components/DialogContent'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation'
import TeamManagementModalBoundary from '../PromoteTeamMemberModal/TeamManagementModalBoundary'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithAtmosphereProps {
  closePortal: () => void
  teamMember: RemoveTeamMemberModal_teamMember
}

const RemoveTeamMemberModal = (props: Props) => {
  const {atmosphere, closePortal, teamMember} = props
  const {teamMemberId, preferredName} = teamMember
  const handleClick = () => {
    closePortal()
    RemoveTeamMemberMutation(atmosphere, teamMemberId)
  }
  return (
    <TeamManagementModalBoundary>
      <DialogHeading>Are you sure?</DialogHeading>
      <DialogContent>
        This will remove {preferredName} from the team.
        <br />
        <StyledButton size="medium" onClick={handleClick}>
          <IconLabel icon="arrow_forward" iconAfter label={`Remove ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </TeamManagementModalBoundary>
  )
}

export default createFragmentContainer(
  withAtmosphere(RemoveTeamMemberModal),
  graphql`
    fragment RemoveTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
)
