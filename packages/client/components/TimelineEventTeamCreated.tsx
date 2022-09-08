import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {TimelineEventTeamCreated_timelineEvent} from '../__generated__/TimelineEventTeamCreated_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventTeamCreated_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventTeamCreated = (props: Props) => {
  const {timelineEvent} = props

  const {t} = useTranslation()

  const {team} = timelineEvent
  const {id: teamId, name: teamName, isArchived} = team
  return (
    <TimelineEventCard
      iconName='group_add'
      timelineEvent={timelineEvent}
      title={
        <TimelineEventTitle>
          {t('TimelineEventTeamCreated.YouCreatedTeamName', {
            teamName
          })}
        </TimelineEventTitle>
      }
    >
      <TimelineEventBody>
        {isArchived ? (
          t('TimelineEventTeamCreated.ButNowItIsArchivedWhatAWildRide')
        ) : (
          <>
            {t('TimelineEventTeamCreated.VisitYour')}
            <Link
              to={t('TimelineEventTeamCreated.TeamTeamId', {
                teamId
              })}
            >
              {t('TimelineEventTeamCreated.TeamDashboard')}
            </Link>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventTeamCreated, {
  timelineEvent: graphql`
    fragment TimelineEventTeamCreated_timelineEvent on TimelineEventTeamCreated {
      ...TimelineEventCard_timelineEvent
      id
      team {
        id
        isArchived
        name
      }
    }
  `
})
