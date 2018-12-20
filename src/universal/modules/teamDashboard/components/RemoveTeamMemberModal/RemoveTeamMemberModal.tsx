import {RemoveTeamMemberModal_teamMember} from '__generated__/RemoveTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import Type from 'universal/components/Type/Type'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation'
import TeamManagementModalBoundary from '../PromoteTeamMemberModal/TeamManagementModalBoundary'

const StyledButton = styled(FlatButton)({
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
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        Are you sure?
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        This will remove {preferredName} from <br />
        the team. <br />
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm'>
        <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
      </StyledButton>
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
