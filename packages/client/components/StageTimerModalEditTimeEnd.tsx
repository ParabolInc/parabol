import styled from '@emotion/styled'
import {Stop} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {PALETTE} from '../styles/paletteV3'
import {MeetingLabels} from '../types/constEnums'
import {StageTimerModalEditTimeEnd_facilitator$key} from '../__generated__/StageTimerModalEditTimeEnd_facilitator.graphql'
import {StageTimerModalEditTimeEnd_stage$key} from '../__generated__/StageTimerModalEditTimeEnd_stage.graphql'
import MenuItemHR from './MenuItemHR'
import PlainButton from './PlainButton/PlainButton'
import StageTimerModalEndTime from './StageTimerModalEndTime'

interface Props {
  closePortal: () => void
  facilitator: StageTimerModalEditTimeEnd_facilitator$key
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
  const {meetingId, closePortal, facilitator: facilitatorRef, stage: stageRef} = props
  const facilitator = useFragment(
    graphql`
      fragment StageTimerModalEditTimeEnd_facilitator on TeamMember {
        ...StageTimerModalEndTime_facilitator
      }
    `,
    facilitatorRef
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
        facilitator={facilitator}
        stage={stage}
        meetingId={meetingId}
      />
    </Modal>
  )
}

export default StageTimerModalEditTimeEnd
