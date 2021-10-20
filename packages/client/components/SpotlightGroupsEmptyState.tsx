import React from 'react'
import styled from '@emotion/styled'
import purpleLines from '../styles/theme/images/purpleLines.svg'
import {PALETTE} from '../styles/paletteV3'

const EmptyState = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  flexWrap: 'wrap'
})

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

const SpotlightGroupsEmptyState = () => {
  return (
    <EmptyState>
      <Emoji>😔</Emoji>
      <Content>
        <Img src={purpleLines} />
        <MessageWrapper>
          <Message>No reflections match this card.</Message>
          <Message>Try searching for specific keywords.</Message>
        </MessageWrapper>
        <Img isFlipped src={purpleLines} />
      </Content>
    </EmptyState>
  )
}

export default SpotlightGroupsEmptyState
