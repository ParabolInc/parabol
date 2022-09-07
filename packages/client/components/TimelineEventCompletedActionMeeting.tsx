import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import relativeDate from '../utils/date/relativeDate'
import plural from '../utils/plural'
import {TimelineEventCompletedActionMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props extends RouteComponentProps<{[x: string]: string | undefined}> {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const CountItem = styled('span')({
  fontWeight: 600
})

const TimelineEventCompletedActionMeeting = (props: Props) => {
  const {timelineEvent} = props

  //FIXME i18n: less than a minute
  //FIXME i18n: agenda item
  const {t} = useTranslation()

  const {meeting, team} = timelineEvent
  const {
    id: meetingId,
    name: meetingName,
    createdAt,
    endedAt,
    agendaItemCount,
    commentCount,
    taskCount
  } = meeting
  const {name: teamName} = team
  const meetingDuration = relativeDate(createdAt, {
    now: endedAt,
    max: 2,
    suffix: false,
    smallDiff: 'less than a minute'
  })
  return (
    <TimelineEventCard
      iconName='change_history'
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {`It lasted ${meetingDuration} and generated `}
        <CountItem>{`${taskCount} ${plural(taskCount, 'task')}`}</CountItem>
        {t('TimelineEventCompletedActionMeeting.')}
        <CountItem>{`${agendaItemCount} ${plural(agendaItemCount, 'agenda item')}`}</CountItem>
        {t('TimelineEventCompletedActionMeeting.And')}
        <CountItem>{`${commentCount} ${plural(commentCount, 'comment')}.`}</CountItem>
        <br />
        <Link to={`/meet/${meetingId}/agendaitems/1`}>
          {t('TimelineEventCompletedActionMeeting.SeeTheDiscussion')}
        </Link>
        {t('TimelineEventCompletedActionMeeting.InYourMeetingOr')}
        <Link to={`/new-summary/${meetingId}`}>
          {t('TimelineEventCompletedActionMeeting.ReviewASummary')}
        </Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventCompletedActionMeeting, {
  timelineEvent: graphql`
    fragment TimelineEventCompletedActionMeeting_timelineEvent on TimelineEventCompletedActionMeeting {
      ...TimelineEventCard_timelineEvent
      id
      type
      meeting {
        id
        agendaItemCount
        commentCount
        createdAt
        endedAt
        name
        taskCount
      }
      team {
        id
        name
      }
    }
  `
})
