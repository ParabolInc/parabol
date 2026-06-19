import styled from '@emotion/styled'
import {Stop} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {StageTimerModalEditTimeEnd_stage$key} from '../__generated__/StageTimerModalEditTimeEnd_stage.graphql'
import type {StageTimerModalEditTimeEnd_teamMember$key} from '../__generated__/StageTimerModalEditTimeEnd_teamMember.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {PALETTE} from '../styles/paletteV3'
import {MeetingLabels} from '../types/constEnums'
import MenuItemHR from './MenuItemHR'
import PlainButton from './PlainButton/PlainButton'
import StageTimerModalEndTime from './StageTimerModalEndTime'

interface Props {
  closePortal: () => void
  teamMember: StageTimerModalEditTimeEnd_teamMember$key
  meetingId: string
  stage: StageTimerModalEditTimeEnd_stage$key
}

const Modal = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
})

const EndTimer = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  width: '100%',
  padding: '8px 16px'
})

const Label = styled('div')({
  lineHeight: 1,
  paddingLeft: 16,
  fontSize: 14
})

const HR = styled(MenuItemHR)({
  marginBottom: -8,
  width: '100%'
})

const StyledIcon = styled(Stop)({
  color: PALETTE.SLATE_600
})

const StageTimerModalEditTimeEnd = (props: Props) => {
  const {meetingId, closePortal, teamMember: teamMemberRef, stage: stageRef} = props
  const teamMember = useFragment(
    graphql`
      fragment StageTimerModalEditTimeEnd_teamMember on TeamMember {
        ...StageTimerModalEndTime_teamMember
      }
    `,
    teamMemberRef
  )
  const stage = useFragment(
    graphql`
      fragment StageTimerModalEditTimeEnd_stage on NewMeetingStage {
        ...StageTimerModalEndTime_stage
      }
    `,
    stageRef
  )
  const atmosphere = useAtmosphere()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const endTimer = () => {
    if (submitting) return
    submitMutation()
    SetStageTimerMutation(atmosphere, {meetingId, scheduledEndTime: null}, {onError, onCompleted})
    closePortal()
  }
  return (
    <Modal>
      <EndTimer onClick={endTimer}>
        <StyledIcon />
        <Label>End {MeetingLabels.TIME_LIMIT}</Label>
      </EndTimer>
      <HR />
      <StageTimerModalEndTime
        closePortal={closePortal}
        teamMember={teamMember}
        stage={stage}
        meetingId={meetingId}
      />
    </Modal>
  )
}

export default StageTimerModalEditTimeEnd
