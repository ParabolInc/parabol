import {PromoteTeamMemberModal_teamMember} from '../../../../__generated__/PromoteTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import PrimaryButton from '../../../../components/PrimaryButton'
import IconLabel from '../../../../components/IconLabel'
import DialogTitle from '../../../../components/DialogTitle'
import DialogContent from '../../../../components/DialogContent'
import DialogContainer from '../../../../components/DialogContainer'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import PromoteToTeamLeadMutation from '../../../../mutations/PromoteToTeamLeadMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

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
  const {preferredName, teamId, newTeamLeadEmail} = teamMember
  const handleClick = () => {
    submitMutation()
    PromoteToTeamLeadMutation(atmosphere, {teamId, newTeamLeadEmail}, {onError, onCompleted})
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

export default createFragmentContainer(withMutationProps(withAtmosphere(PromoteTeamMemberModal)), {
  teamMember: graphql`
    fragment PromoteTeamMemberModal_teamMember on TeamMember {
      newTeamLeadEmail: email
      teamId
      preferredName
    }
  `
})
