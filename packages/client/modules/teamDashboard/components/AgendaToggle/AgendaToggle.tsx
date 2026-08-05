import {Chat} from '@mui/icons-material'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import ToggleTeamDrawerMutation from '~/mutations/ToggleTeamDrawerMutation'

interface Props {
  teamId: string
}

const AgendaToggle = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: 'agenda'},
        {onError, onCompleted}
      )
    }
  }
  return (
    <div className='mx-[6px] hover:cursor-pointer hover:[&_svg]:text-sky-600' onClick={toggleHide}>
      <div className='flex h-7 justify-center'>
        <Chat className='self-center text-accent' />
      </div>
      <div className='text-center font-semibold text-[12px] text-fg-primary leading-4'>Agenda</div>
    </div>
  )
}

export default AgendaToggle
