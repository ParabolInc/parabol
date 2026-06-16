import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import {useState} from 'react'
import FlatButton from '~/components/FlatButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import useHotkey from '~/hooks/useHotkey'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import lazyPreload from '~/utils/lazyPreload'

interface Props {
  meetingId: string
}

const StyledButton = styled(FlatButton)({
  fontWeight: 600,
  height: 28,
  marginLeft: 16,
  padding: 0
})

const StyledIcon = styled(Edit)({
  marginRight: 4
})

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
      <StyledButton onClick={() => setIsOpen(true)} palette={'blue'}>
        <StyledIcon />
        {' Edit Groups'}
      </StyledButton>
      <UndoableGroupPhaseDialog
        isOpen={isOpen}
        closePortal={() => setIsOpen(false)}
        meetingId={meetingId}
      />
    </>
  )
}

export default UndoableGroupPhaseControl
