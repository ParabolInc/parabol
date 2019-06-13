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

interface Props {
  meetingId: string
  stage: StageTimerModalEditTimeEnd_stage
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
const StageTimerModalEditTimeEnd = (props: Props) => {
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
        <Icon>stop</Icon>
        <Label>End Timebox</Label>
      </EndTimer>
      <HR />
      <StageTimerModalEndTime closePortal={closePortal} stage={stage} meetingId={meetingId} />
    </Modal>
  )
}

export default createFragmentContainer(
  StageTimerModalEditTimeEnd,
  graphql`
    fragment StageTimerModalEditTimeEnd_stage on NewMeetingStage {
      ...StageTimerModalEndTime_stage
    }
  `
)
