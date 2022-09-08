import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../../../../styles/paletteV3'

interface Props {
  isComplete: boolean
  isMeeting: boolean
}

const EmptyBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '8px 8px 0 56px'
})

const EmptyMessage = styled('div')({
  color: PALETTE.SLATE_600,
  flex: 1,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '20px',
  paddingTop: 4
})

const AgendaListEmptyState = (props: Props) => {
  const {isComplete, isMeeting} = props

  const {t} = useTranslation()

  const meetingContext = isMeeting ? 'meeting' : t('AgendaListEmptyState.NextMeeting')

  if (isComplete) return null
  return (
    <EmptyBlock>
      <EmptyMessage>
        {t('AgendaListEmptyState.PssstAddTopicsForYourMeetingContextUseAPhraseLike', {
          meetingContext
        })}
        <b>
          <i>{t('AgendaListEmptyState.UpcomingVacation')}</i>
        </b>
        {'.”'}
      </EmptyMessage>
    </EmptyBlock>
  )
}

export default AgendaListEmptyState
