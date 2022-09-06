import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../styles/paletteV3'
import purpleLines from '../styles/theme/images/purpleLines.svg'

const EmptyState = styled('div')<{height: number | string}>(({height}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  flexWrap: 'wrap',
  minHeight: 160,
  height
}))

const MessageWrapper = styled('div')({
  display: 'flex',
  padding: '0px 8px',
  flexDirection: 'column',
  height: 'fit-content'
})

const Emoji = styled('div')({
  textAlign: 'center',
  paddingBottom: 4,
  width: '100%'
})
const Img = styled('img')<{isFlipped?: boolean}>(({isFlipped}) => ({
  width: 24,
  height: 24,
  transform: isFlipped ? `scaleX(-1)` : undefined
}))

const Message = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center',
  color: PALETTE.SLATE_700
})

const Content = styled('div')({
  display: 'flex',
  alignItems: 'center'
})

interface Props {
  height: string | number
}

const SpotlightResultsEmptyState = (props: Props) => {
  const {height} = props

  const {t} = useTranslation()

  return (
    <EmptyState height={height}>
      <Emoji>{t('SpotlightResultsEmptyState.\ude14')}</Emoji>
      <Content>
        <Img src={purpleLines} />
        <MessageWrapper>
          <Message>{t('SpotlightResultsEmptyState.NoReflectionsMatchThisCard.')}</Message>
          <Message>{t('SpotlightResultsEmptyState.TrySearchingForSpecificKeywords.')}</Message>
        </MessageWrapper>
        <Img isFlipped src={purpleLines} />
      </Content>
    </EmptyState>
  )
}

export default SpotlightResultsEmptyState
