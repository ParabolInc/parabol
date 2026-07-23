import {Edit} from '@mui/icons-material'
import {useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useHotkey from '~/hooks/useHotkey'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import lazyPreload from '~/utils/lazyPreload'
import {Button} from '../ui/Button/Button'

interface Props {
  meetingId: string
}

const UndoableGroupPhaseDialog = lazyPreload(
  () => import(/* webpackChunkName: 'UndoableGroupPhaseDialog' */ './UndoableGroupPhaseDialog')
)

const UndoableGroupPhaseControl = (props: Props) => {
  const {meetingId} = props
  const [isOpen, setIsOpen] = useState(false)
  const atmosphere = useAtmosphere()
  useHotkey('i d i d n t m e a n t o', () => {
    console.log('didntmean')
    ResetRetroMeetingToGroupStageMutation(atmosphere, {meetingId})
  })
  return (
    <>
      <Button
        variant='flat'
        onClick={() => setIsOpen(true)}
        className='ml-4 h-7 gap-1 px-2 font-semibold text-sky-500 text-sm'
      >
        <Edit className='size-5' />
        Edit Groups
      </Button>
      <UndoableGroupPhaseDialog
        isOpen={isOpen}
        closePortal={() => setIsOpen(false)}
        meetingId={meetingId}
      />
    </>
  )
}

export default UndoableGroupPhaseControl
