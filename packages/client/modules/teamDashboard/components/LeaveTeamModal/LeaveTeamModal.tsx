import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {LeaveTeamModal_teamMember$key} from '../../../../__generated__/LeaveTeamModal_teamMember.graphql'
import IconLabel from '../../../../components/IconLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import RemoveTeamMemberMutation from '../../../../mutations/RemoveTeamMemberMutation'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  teamMember: LeaveTeamModal_teamMember$key
  closePortal: () => void
}

const LeaveTeamModal = (props: Props) => {
  const {isOpen, closePortal, teamMember: teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment LeaveTeamModal_teamMember on TeamMember {
        userId
        teamId
      }
    `,
    teamMemberRef
  )
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {userId, teamId} = teamMember
  const handleClick = () => {
    navigate('/meetings')
    closePortal()
    RemoveTeamMemberMutation(atmosphere, {userId, teamId})
  }
  return (
    <Dialog isOpen={isOpen} onClose={closePortal}>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        <p>This will remove you from the team.</p>
        <p>All of your tasks will be given to the team lead.</p>
        <Button variant='primary' size='md' className='mx-auto mt-6 mb-0' onClick={handleClick}>
          <IconLabel icon='arrow_forward' iconAfter label='Leave the team' />
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveTeamModal
