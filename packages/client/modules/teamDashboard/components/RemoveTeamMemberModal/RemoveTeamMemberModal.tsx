import {RemoveTeamMemberModal_teamMember} from '../../../../__generated__/RemoveTeamMemberModal_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import PrimaryButton from '../../../../components/PrimaryButton'
import IconLabel from '../../../../components/IconLabel'
import DialogContainer from '../../../../components/DialogContainer'
import DialogTitle from '../../../../components/DialogTitle'
import DialogContent from '../../../../components/DialogContent'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import RemoveTeamMemberMutation from '../../../../mutations/RemoveTeamMemberMutation'

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
