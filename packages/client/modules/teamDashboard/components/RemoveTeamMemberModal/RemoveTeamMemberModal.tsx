import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {RemoveTeamMemberModal_teamMember$key} from '../../../../__generated__/RemoveTeamMemberModal_teamMember.graphql'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import RemoveTeamMemberMutation from '../../../../mutations/RemoveTeamMemberMutation'

interface Props {
  closePortal: () => void
  teamMember: RemoveTeamMemberModal_teamMember$key
}

const RemoveTeamMemberModal = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {closePortal, teamMember: teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment RemoveTeamMemberModal_teamMember on TeamMember {
        teamMemberId: id
        user {
          preferredName
        }
      }
    `,
    teamMemberRef
  )
  const {teamMemberId, user} = teamMember
  const {preferredName} = user
  const handleClick = () => {
    closePortal()
    RemoveTeamMemberMutation(atmosphere, {teamMemberId})
  }
  return (
    <DialogContainer>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        This will remove {preferredName} from the team.
        <br />
        <PrimaryButton size='medium' className='mx-auto mt-6 mb-0' onClick={handleClick}>
          <IconLabel
            icon='arrow_forward'
            iconAfter
            label={<div className='break-word whitespace-normal'>Remove {preferredName}</div>}
          />
        </PrimaryButton>
      </DialogContent>
    </DialogContainer>
  )
}

export default RemoveTeamMemberModal
