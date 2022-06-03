import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import RemoveTeamMemberMutation from '../../../../mutations/RemoveTeamMemberMutation'
import {RemoveTeamMemberModal_teamMember} from '../../../../__generated__/RemoveTeamMemberModal_teamMember.graphql'

const StyledDialogContainer = styled(DialogContainer)({
  width: 320
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  closePortal: () => void
  teamMember: RemoveTeamMemberModal_teamMember
}

const RemoveTeamMemberModal = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {closePortal, teamMember} = props
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

export default createFragmentContainer(RemoveTeamMemberModal, {
  teamMember: graphql`
    fragment RemoveTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
})
