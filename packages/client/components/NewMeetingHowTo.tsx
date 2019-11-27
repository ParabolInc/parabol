import React from 'react'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingHowToRetrospective from './NewMeetingHowToRetrospective'

interface Props {
  meetingType: MeetingTypeEnum
}

const howToLookup = {
  // [MeetingTypeEnum.action]: NewMeetingHowToAction,
  [MeetingTypeEnum.retrospective]: NewMeetingHowToRetrospective
}

const NewMeetingHowTo = (props: Props) => {
  const {meetingType} = props
  const HowTo = howToLookup[meetingType]
  return <HowTo />
}

export default NewMeetingHowTo
