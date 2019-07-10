import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {StageTimerModalEditTimeEnd_stage} from '__generated__/StageTimerModalEditTimeEnd_stage.graphql'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import SetStageTimerMutation from 'universal/mutations/SetStageTimerMutation'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import MenuItemHR from 'universal/components/MenuItemHR'
import StageTimerModalEndTime from 'universal/components/StageTimerModalEndTime'
import {StageTimerModalEditTimeEnd_facilitator} from '__generated__/StageTimerModalEditTimeEnd_facilitator.graphql'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  closePortal: () => void
  facilitator: StageTimerModalEditTimeEnd_facilitator
  meetingId: string
  stage: StageTimerModalEditTimeEnd_stage
  teamId: string
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
  color: PALETTE.TEXT_LIGHT
})

const StageTimerModalEditTimeEnd = (props: Props) => {
  const {meetingId, closePortal, facilitator, teamId, stage} = props
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
        <Label>End Timebox</Label>
      </EndTimer>
      <HR />
      <StageTimerModalEndTime
        closePortal={closePortal}
        facilitator={facilitator}
        stage={stage}
        meetingId={meetingId}
        teamId={teamId}
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
