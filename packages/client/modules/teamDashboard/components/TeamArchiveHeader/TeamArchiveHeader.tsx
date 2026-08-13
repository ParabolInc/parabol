import {useNavigate} from 'react-router'
import {Archive} from '~/ui/icons'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'

interface Props {
  teamId: string
}

const TeamArchiveHeader = (props: Props) => {
  const {teamId} = props
  const navigate = useNavigate()
  const goToTeamDash = () => navigate(`/team/${teamId}/tasks`)
  return (
    <div className='flex w-full items-center py-4'>
      <div className='mr-8 flex items-center whitespace-nowrap'>
        <Archive className='mr-2 text-fg-secondary' />
        <div className='text-[18px] leading-8'>Archived Tasks</div>
      </div>
      <DashNavControl icon='arrow_back' label='Back to Team Tasks' onClick={goToTeamDash} />
    </div>
  )
}

export default TeamArchiveHeader
