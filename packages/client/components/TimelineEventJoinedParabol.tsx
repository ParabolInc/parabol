import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {TimelineEventJoinedParabol_timelineEvent} from '../__generated__/TimelineEventJoinedParabol_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventJoinedParabol_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventJoinedParabol = (props: Props) => {
  const {timelineEvent} = props

  const {t} = useTranslation()

  return (
    <TimelineEventCard
      iconName='account_circle'
      timelineEvent={timelineEvent}
      title={
        <TimelineEventTitle>{t('TimelineEventJoinedParabol.YouJoinedParabol')}</TimelineEventTitle>
      }
    >
      <TimelineEventBody>
        {t('TimelineEventJoinedParabol.GetStartedByUpdatingYourNameAndAvatarInYour')}
        <Link to='/me/profile'>{t('TimelineEventJoinedParabol.UserProfile')}</Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventJoinedParabol, {
  timelineEvent: graphql`
    fragment TimelineEventJoinedParabol_timelineEvent on TimelineEventJoinedParabol {
      ...TimelineEventCard_timelineEvent
      id
    }
  `
})
