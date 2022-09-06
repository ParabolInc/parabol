import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import plural from '../utils/plural'
import {TimelineEventCompletedRetroMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventCompletedRetroMeeting_timelineEvent
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventCompletedRetroMeeting = (props: Props) => {
  const {timelineEvent} = props

  const {t} = useTranslation()

  const {meeting, team} = timelineEvent
  const {
    id: meetingId,
    name: meetingName,
    commentCount,
    reflectionCount,
    topicCount,
    taskCount
  } = meeting
  const {name: teamName} = team
  return (
    <TimelineEventCard
      iconName='history'
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {t('TimelineEventCompletedRetroMeeting.YourTeamShared')}
        <CountItem>
          {reflectionCount} {plural(reflectionCount, 'reflection')}
        </CountItem>
        {t('TimelineEventCompletedRetroMeeting.AndGroupedThemInto')}
        <CountItem>
          {topicCount} {plural(topicCount, 'topic')}
        </CountItem>
        {t('TimelineEventCompletedRetroMeeting..')}
        <br />
        {t('TimelineEventCompletedRetroMeeting.YouAdded')}
        <CountItem>
          {commentCount} {plural(commentCount, 'comment')}
        </CountItem>
        {t('TimelineEventCompletedRetroMeeting.AndCreated')}
        <CountItem>
          {taskCount} {plural(taskCount, 'task')}
        </CountItem>
        {t('TimelineEventCompletedRetroMeeting..')}
        <br />
        <Link to={`/meet/${meetingId}/discuss/1`}>
          {t('TimelineEventCompletedRetroMeeting.SeeTheDiscussion')}
        </Link>
        {t('TimelineEventCompletedRetroMeeting.InYourMeetingOr')}
        <Link to={`/new-summary/${meetingId}`}>
          {t('TimelineEventCompletedRetroMeeting.ReviewASummary')}
        </Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventCompletedRetroMeeting, {
  timelineEvent: graphql`
    fragment TimelineEventCompletedRetroMeeting_timelineEvent on TimelineEventCompletedRetroMeeting {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        commentCount
        name
        reflectionCount
        taskCount
        topicCount
      }
      team {
        id
        name
      }
    }
  `
})
