import styled from '@emotion/styled'
import {TimerOff} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {PALETTE} from '../styles/paletteV3'
import {MeetingLabels} from '../types/constEnums'
import {StageTimerModalEditTimeLimit_stage} from '../__generated__/StageTimerModalEditTimeLimit_stage.graphql'
import MenuItemHR from './MenuItemHR'
import PlainButton from './PlainButton/PlainButton'
import StageTimerModalTimeLimit from './StageTimerModalTimeLimit'

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

const StyledIcon = styled(TimerOff)({
  color: PALETTE.SLATE_600
})

const StageTimerModalEditTimeLimit = (props: Props) => {
  const {meetingId, closePortal, stage} = props

  const {t} = useTranslation()

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
        <Label>
          {t('StageTimerModalEditTimeLimit.End')}
          {MeetingLabels.TIMER}
        </Label>
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
