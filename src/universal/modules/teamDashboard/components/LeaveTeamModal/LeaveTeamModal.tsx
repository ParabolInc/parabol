import {LeaveTeamModal_teamMember} from '__generated__/LeaveTeamModal_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
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

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  teamMember: LeaveTeamModal_teamMember
  closePortal: () => void
}

const LeaveTeamModal = (props: Props) => {
  const {atmosphere, closePortal, history, teamMember} = props
  const {teamMemberId} = teamMember
  const handleClick = () => {
    history.push('/me')
    closePortal()
    RemoveTeamMemberMutation(atmosphere, teamMemberId)
  }
  return (
    <TeamManagementModalBoundary>
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        {'Are you sure?'}
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        {'This will remove you from the team.'}
        <br />
        {`All of your tasks will be given to the team lead`}
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm'>
        <IconLabel icon='arrow_forward' iconAfter label='Leave the team' />
      </StyledButton>
    </TeamManagementModalBoundary>
  )
}

export default createFragmentContainer(
  withAtmosphere(withRouter(LeaveTeamModal)),
  graphql`
    fragment LeaveTeamModal_teamMember on TeamMember {
      teamMemberId: id
    }
  `
)
