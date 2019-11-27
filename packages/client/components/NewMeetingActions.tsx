import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {NewMeetingActions_viewer} from '__generated__/NewMeetingActions_viewer.graphql'
import {MeetingTypeEnum} from '../types/graphql'
import PrimaryButton from './PrimaryButton'
import Icon from './Icon'

const ButtonBlock = styled('div')({
  gridRowStart: 3,
  paddingTop: 32
})

const StartButton = styled(PrimaryButton)({
  fontSize: 20,
  width: 320
})

const ForwardIcon = styled(Icon)({
  paddingLeft: 16
})

interface Props {
  meetingType: MeetingTypeEnum
  setMeetingType: (meetingType: MeetingTypeEnum) => void
  viewer: NewMeetingActions_viewer
}

const NewMeetingActions = (props: Props) => {
  return (
    <ButtonBlock>
      <StartButton size={'large'}>
        Start Meeting
        <ForwardIcon>arrow_forward</ForwardIcon>
      </StartButton>
    </ButtonBlock>
  )
}

export default createFragmentContainer(NewMeetingActions, {
  viewer: graphql`
    fragment NewMeetingActions_viewer on User {
      id
    }
  `
})
