import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import plural from '../utils/plural'
import {TimelineEventPokerComplete_timelineEvent} from '../__generated__/TimelineEventPokerComplete_timelineEvent.graphql'
import CardsSVG from './CardsSVG'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventPokerComplete_timelineEvent
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventPokerComplete = (props: Props) => {
  const {timelineEvent} = props

  const {t} = useTranslation()

  const {meeting, team} = timelineEvent
  const {id: meetingId, name: meetingName, commentCount, storyCount} = meeting
  const {name: teamName} = team
  return (
    <TimelineEventCard
      IconSVG={<CardsSVG />}
      timelineEvent={timelineEvent}
      title={
        <TimelineEventTitle>
          {t('TimelineEventPokerComplete.MeetingNameWithTeamNameComplete', {
            meetingName,
            teamName
          })}
        </TimelineEventTitle>
      }
    >
      <TimelineEventBody>
        {t('TimelineEventPokerComplete.YouVotedOn')}
        <CountItem>
          {storyCount} {plural(storyCount, 'story', 'stories')}
        </CountItem>
        {t('TimelineEventPokerComplete.AndAdded')}
        <CountItem>
          {commentCount} {plural(commentCount, 'comment')}
        </CountItem>
        {'.'}
        <br />
        <Link
          to={t('TimelineEventPokerComplete.MeetMeetingIdEstimate1', {
            meetingId
          })}
        >
          {t('TimelineEventPokerComplete.SeeTheEstimates')}
        </Link>
        {t('TimelineEventPokerComplete.InYourMeetingOr')}
        <Link
          to={t('TimelineEventPokerComplete.NewSummaryMeetingId', {
            meetingId
          })}
        >
          {t('TimelineEventPokerComplete.ReviewASummary')}
        </Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventPokerComplete, {
  timelineEvent: graphql`
    fragment TimelineEventPokerComplete_timelineEvent on TimelineEventPokerComplete {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        commentCount
        storyCount
        name
        phases {
          phaseType
          ... on EstimatePhase {
            stages {
              id
            }
          }
        }
      }
      team {
        id
        name
      }
    }
  `
})
