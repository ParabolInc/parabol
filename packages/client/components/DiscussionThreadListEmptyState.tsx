import React from 'react'
import ThreadEmptyMessage from './ThreadEmptyMessage'
import {MeetingTypeEnum} from '~/types/graphql'

interface Props {
  isEndedMeeting: boolean
  meetingType: MeetingTypeEnum
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isEndedMeeting, meetingType} = props
  const meetingEndedMessage = meetingType === MeetingTypeEnum.poker
    ? 'No comments were added here'
    : 'No comments or tasks were added here'
  const message = meetingType === MeetingTypeEnum.poker
    ? '✍️ Be the first to add a comment'
    : '✍️ Be the first to add a comment or task'
  if (isEndedMeeting) return <ThreadEmptyMessage>{meetingEndedMessage}</ThreadEmptyMessage>
  return <ThreadEmptyMessage>{message}</ThreadEmptyMessage>
}

export default DiscussionThreadListEmptyState
