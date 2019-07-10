import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {StageTimerModalEditTimeLimit_stage} from '__generated__/StageTimerModalEditTimeLimit_stage.graphql'
import styled from 'react-emotion'
import StageTimerModalTimeLimit from 'universal/components/StageTimerModalTimeLimit'
import Icon from 'universal/components/Icon'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import SetStageTimerMutation from 'universal/mutations/SetStageTimerMutation'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import MenuItemHR from 'universal/components/MenuItemHR'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  meetingId: string
  stage: StageTimerModalEditTimeLimit_stage
  closePortal: () => void
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

const StageTimerModalEditTimeLimit = (props: Props) => {
  const {meetingId, closePortal, stage} = props
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
        <StyledIcon>timer_off</StyledIcon>
        <Label>End Timer</Label>
      </EndTimer>
      <HR />
      <StageTimerModalTimeLimit
        closePortal={closePortal}
        stage={stage}
        meetingId={meetingId}
        defaultTimeLimit={1}
      />
    </Modal>
  )
}

export default createFragmentContainer(StageTimerModalEditTimeLimit, {
  stage: graphql`
    fragment StageTimerModalEditTimeLimit_stage on NewMeetingStage {
      ...StageTimerModalTimeLimit_stage
    }
  `
})
