import {RemoveTeamMemberModal_teamMember} from '__generated__/RemoveTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import DialogContainer from 'universal/components/DialogContainer'
import DialogTitle from 'universal/components/DialogTitle'
import DialogContent from 'universal/components/DialogContent'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation'

const StyledDialogContainer = styled(DialogContainer)({
  width: 320
})

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
    <StyledDialogContainer>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        This will remove {preferredName} from the team.
        <br />
        <StyledButton size='medium' onClick={handleClick}>
          <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default createFragmentContainer(withAtmosphere(RemoveTeamMemberModal), {
  teamMember: graphql`
    fragment RemoveTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
})
