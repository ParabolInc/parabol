import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import { NewMeetingSettings_viewer } from '__generated__/NewMeetingSettings_viewer.graphql'
import {MeetingTypeEnum} from '../types/graphql'

const SelectorBlock = styled('div')({

})

interface Props {
  meetingType: MeetingTypeEnum
  setMeetingType: (meetingType: MeetingTypeEnum) => void
  viewer: NewMeetingSettings_viewer
}

const settingsLookup = {
  [MeetingTypeEnum.action]: NewMeetingSettingsAction,
  [MeetingTypeEnum.retrospective]: NewMeetingSettingsRetrospective,
}

const NewMeetingSettings = (props: Props) => {
  const {meetingType, viewer} = props
  const Settings = settingsLookup[meetingType]
  return <Settings viewer={viewer}/>
}

export default createFragmentContainer(
  NewMeetingSettings,
  {
    viewer: graphql`
    fragment NewMeetingSettings_viewer on User {
      id
    }`
  }
)
