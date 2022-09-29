import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {PALETTE} from '../styles/paletteV3'
import {MeetingLabels} from '../types/constEnums'
import {StageTimerModalEditTimeEnd_facilitator} from '../__generated__/StageTimerModalEditTimeEnd_facilitator.graphql'
import {StageTimerModalEditTimeEnd_stage} from '../__generated__/StageTimerModalEditTimeEnd_stage.graphql'
import Icon from './Icon'
import MenuItemHR from './MenuItemHR'
import PlainButton from './PlainButton/PlainButton'
import StageTimerModalEndTime from './StageTimerModalEndTime'

interface Props {
  closePortal: () => void
  facilitator: StageTimerModalEditTimeEnd_facilitator
  meetingId: string
  stage: StageTimerModalEditTimeEnd_stage
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

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600
})

const StageTimerModalEditTimeEnd = (props: Props) => {
  const {meetingId, closePortal, facilitator, stage} = props
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
        <StyledIcon>stop</StyledIcon>
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

export default createFragmentContainer(StageTimerModalEditTimeEnd, {
  facilitator: graphql`
    fragment StageTimerModalEditTimeEnd_facilitator on TeamMember {
      ...StageTimerModalEndTime_facilitator
    }
  `,
  stage: graphql`
    fragment StageTimerModalEditTimeEnd_stage on NewMeetingStage {
      ...StageTimerModalEndTime_stage
    }
  `
})
