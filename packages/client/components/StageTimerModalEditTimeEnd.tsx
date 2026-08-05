import {Stop} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {StageTimerModalEditTimeEnd_stage$key} from '../__generated__/StageTimerModalEditTimeEnd_stage.graphql'
import type {StageTimerModalEditTimeEnd_teamMember$key} from '../__generated__/StageTimerModalEditTimeEnd_teamMember.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
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
    <div className='flex flex-col items-center'>
      <PlainButton className='flex w-full items-center px-4 py-2' onClick={endTimer}>
        <Stop className='text-fg-secondary' />
        <div className='pl-4 text-[14px] leading-none'>End {MeetingLabels.TIME_LIMIT}</div>
      </PlainButton>
      <MenuItemHR className='-mb-2 w-full' />
      <StageTimerModalEndTime
        closePortal={closePortal}
        teamMember={teamMember}
        stage={stage}
        meetingId={meetingId}
      />
    </div>
  )
}

export default StageTimerModalEditTimeEnd
