import React from 'react'
import useHotkey from '~/hooks/useHotkey'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import useAtmosphere from '~/hooks/useAtmosphere'
import ResetMeetingToStageMutation from '~/mutations/ResetMeetingToStageMutation'

const Wrapper = styled('div')({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_GRAY,
  borderRadius: 4,
  color: '#fff',
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  marginBottom: 8,
  maxHeight: 28,
  padding: '4px 16px'
})

interface Props {
  meetingId: string
  resetToStageId: string
}

const UndoablePhaseCompleted = (props: Props) => {
  const {meetingId, resetToStageId} = props
  const atmosphere = useAtmosphere()
  useHotkey('i d i d n t m e a n t o', () => {
    console.log('meetingId:', meetingId)
    console.log('stage id:', resetToStageId)
    ResetMeetingToStageMutation(atmosphere, {meetingId, stageId: resetToStageId})
  })
  return <Wrapper>Phase Completed</Wrapper>
}

export default UndoablePhaseCompleted
