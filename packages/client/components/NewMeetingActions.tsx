import React from 'react'
import styled from '@emotion/styled'
import {MeetingTypeEnum} from '../types/graphql'
import PrimaryButton from './PrimaryButton'
import Icon from './Icon'
import StartNewMeetingMutation from '../mutations/StartNewMeetingMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import useMutationProps from '../hooks/useMutationProps'
import StyledError from './StyledError'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'

const ButtonBlock = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: isDesktop ? 'flex-start' : 'flex-end',
  gridArea: 'actions',
  padding: 8,
  paddingTop: 32,
  paddingBottom: 32,
  width: '100%'
}))

const StartButton = styled(PrimaryButton)({
  fontSize: 20,
  width: 320,
  maxWidth: '100%'
})

const ForwardIcon = styled(Icon)({
  paddingLeft: 16
})

interface Props {
  meetingType: MeetingTypeEnum
  teamId: string
}

const NewMeetingActions = (props: Props) => {
  const {teamId, meetingType} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, error, submitting, onError, onCompleted} = useMutationProps()
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  const onStartMeetingClick = () => {
    if (submitting) return
    submitMutation()
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history, onError, onCompleted})
  }

  return (
    <ButtonBlock isDesktop={isDesktop}>
      {error && <StyledError>{error.message}</StyledError>}
      <StartButton size={'large'} onClick={onStartMeetingClick} waiting={submitting}>
        Start Meeting
        <ForwardIcon>arrow_forward</ForwardIcon>
      </StartButton>
    </ButtonBlock>
  )
}

export default NewMeetingActions
