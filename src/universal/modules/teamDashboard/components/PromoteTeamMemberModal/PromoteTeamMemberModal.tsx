import {PromoteTeamMemberModal_teamMember} from '__generated__/PromoteTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import Type from 'universal/components/Type/Type'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import PromoteToTeamLeadMutation from 'universal/mutations/PromoteToTeamLeadMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import TeamManagementModalBoundary from './TeamManagementModalBoundary'

const StyledButton = styled(FlatButton)({
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
    <TeamManagementModalBoundary>
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        {'Are you sure?'}
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        {'You will be removed as the team leader'}
        <br />
        {`and promote ${preferredName}. You will no`}
        <br />
        {'longer be able to change team membership.'}
        <br />
        <br />
        {'This cannot be undone!'}
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm' waiting={submitting}>
        <IconLabel icon='arrow_forward' iconAfter label={`Yes, promote ${preferredName}`} />
      </StyledButton>
    </TeamManagementModalBoundary>
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
