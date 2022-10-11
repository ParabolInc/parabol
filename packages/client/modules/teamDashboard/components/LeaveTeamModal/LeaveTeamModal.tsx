import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRouter from '../../../../hooks/useRouter'
import RemoveTeamMemberMutation from '../../../../mutations/RemoveTeamMemberMutation'
import {LeaveTeamModal_teamMember} from '../../../../__generated__/LeaveTeamModal_teamMember.graphql'

const StyledDialogContainer = styled(DialogContainer)({
  width: 356
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  teamMember: LeaveTeamModal_teamMember
  closePortal: () => void
}

const LeaveTeamModal = (props: Props) => {
  const {closePortal, teamMember} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {teamMemberId} = teamMember
  const handleClick = () => {
    history.push('/meetings')
    closePortal()
    RemoveTeamMemberMutation(atmosphere, {teamMemberId})
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{'Are you sure?'}</DialogTitle>
      <DialogContent>
        {'This will remove you from the team.'}
        <br />
        {'All of your tasks will be given to the team lead.'}
        <StyledButton size='medium' onClick={handleClick}>
          <IconLabel icon='arrow_forward' iconAfter label='Leave the team' />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default createFragmentContainer(LeaveTeamModal, {
  teamMember: graphql`
    fragment LeaveTeamModal_teamMember on TeamMember {
      teamMemberId: id
    }
  `
})
