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
    smallDiff: t('TimelineEventCompletedActionMeeting.LessThanAMinute')
  })
  return (
    <TimelineEventCard
      iconName='change_history'
      timelineEvent={timelineEvent}
      title={
        <TimelineEventTitle>
          {t('TimelineEventCompletedActionMeeting.MeetingNameWithTeamNameComplete', {
            meetingName,
            teamName
          })}
        </TimelineEventTitle>
      }
    >
      <TimelineEventBody>
        {t('TimelineEventCompletedActionMeeting.ItLastedMeetingDurationAndGenerated', {
          meetingDuration
        })}
        <CountItem>
          {t('TimelineEventCompletedActionMeeting.TaskCountPluralTaskCountTask', {
            taskCount,
            pluralTaskCountTask: plural(taskCount, 'task')
          })}
        </CountItem>
        {', '}
        <CountItem>
          {t('TimelineEventCompletedActionMeeting.AgendaItemCountPluralAgendaItemCountAgendaItem', {
            agendaItemCount,
            pluralAgendaItemCountAgendaItem: plural(agendaItemCount, 'agenda item')
          })}
        </CountItem>
        {t('TimelineEventCompletedActionMeeting.And')}
        <CountItem>
          {t('TimelineEventCompletedActionMeeting.CommentCountPluralCommentCountComment', {
            commentCount,
            pluralCommentCountComment: plural(commentCount, 'comment')
          })}
        </CountItem>
        <br />
        <Link
          to={t('TimelineEventCompletedActionMeeting.MeetMeetingIdAgendaitems1', {
            meetingId
          })}
        >
          {t('TimelineEventCompletedActionMeeting.SeeTheDiscussion')}
        </Link>
        {t('TimelineEventCompletedActionMeeting.InYourMeetingOr')}
        <Link
          to={t('TimelineEventCompletedActionMeeting.NewSummaryMeetingId', {
            meetingId
          })}
        >
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
