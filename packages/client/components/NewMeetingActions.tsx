import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {NewMeetingActions_viewer} from '__generated__/NewMeetingActions_viewer.graphql'
import {MeetingTypeEnum} from '../types/graphql'

const ButtonBlock = styled('div')({})

interface Props {
  meetingType: MeetingTypeEnum
  setMeetingType: (meetingType: MeetingTypeEnum) => void
  viewer: NewMeetingActions_viewer
}

const NewMeetingActions = (props: Props) => {
  const {viewer} = props
  return <ButtonBlock>{viewer.id}</ButtonBlock>
}

export default createFragmentContainer(NewMeetingActions, {
  viewer: graphql`
    fragment NewMeetingActions_viewer on User {
      id
    }
  `
})
