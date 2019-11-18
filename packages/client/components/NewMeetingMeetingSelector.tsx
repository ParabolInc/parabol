import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import { NewMeetingMeetingSelector_viewer } from '__generated__/NewMeetingMeetingSelector_viewer.graphql'
import {MeetingTypeEnum} from '../types/graphql'

const SelectorBlock = styled('div')({

})

interface Props {
  meetingType: MeetingTypeEnum
  setMeetingType: (meetingType: MeetingTypeEnum) => void
  viewer: NewMeetingMeetingSelector_viewer
}

const NewMeetingMeetingSelector = (props: Props) => {
  const {viewer} = props
  console.log(viewer)
  return (
    <SelectorBlock>
      {/*<NewMeetingMeetingPicker/>*/}
      {/*<NewMeetingMeetingHowTo/>*/}
    </SelectorBlock>
  )
}

export default createFragmentContainer(
  NewMeetingMeetingSelector,
  {
    viewer: graphql`
    fragment NewMeetingMeetingSelector_viewer on User {
      id
    }`
  }
)
