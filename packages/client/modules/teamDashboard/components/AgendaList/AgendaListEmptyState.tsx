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

  //FIXME i18n: next meeting
  const {t} = useTranslation()

  const meetingContext = isMeeting ? 'meeting' : 'next meeting'

  if (isComplete) return null
  return (
    <EmptyBlock>
      <EmptyMessage>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}
        <b>
          <i>{t('AgendaListEmptyState.UpcomingVacation')}</i>
        </b>
        {t('AgendaListEmptyState.')}
      </EmptyMessage>
    </EmptyBlock>
  )
}

export default AgendaListEmptyState
