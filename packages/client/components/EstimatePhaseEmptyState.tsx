import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import MeetingCopy from '~/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '~/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StyledLink from './StyledLink'

const StyledHeading = styled(MeetingPhaseHeading)({
  paddingBottom: '16px',
  textAlign: 'center'
})

const StyledCopy = styled(MeetingCopy)({
  margin: 0,
  padding: '12px 0',
  textAlign: 'center'
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const EmptyStateContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

interface Props {
  meetingId: string
}

const EstimatePhaseEmptyState = (props: Props) => {
  const {meetingId} = props

  const {t} = useTranslation()

  return (
    <EmptyStateContainer>
      <StyledHeading>{t('EstimatePhaseEmptyState.NoItemsToEstimate')}</StyledHeading>
      <StyledCopy>{t('EstimatePhaseEmptyState.ItLooksLikeYouHavenTAddedAnyItemsYet')}</StyledCopy>
      <StyledCopy>
        {t('EstimatePhaseEmptyState.TryAddingThem')}
        <Link to={`/meet/${meetingId}/scope`}>{t('EstimatePhaseEmptyState.Here')}</Link>
      </StyledCopy>
    </EmptyStateContainer>
  )
}

export default EstimatePhaseEmptyState
