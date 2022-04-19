import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import EmptyDiscussionIllustration from '../../../static/images/illustrations/discussions.png'
import TangledArrowSVG from './TangledArrowSVG'

const mobileBreakpoint = makeMinWidthMediaQuery(380)

const DiscussionThreadEmptyStateRoot = styled('div')({
  padding: '12px 24px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0
})

const EmptyDiscussionContainer = styled('div')({
  width: 160,
  margin: '14px auto',
  textAlign: 'center',
  [mobileBreakpoint]: {
    width: 260
  }
})

const EmptyDiscussionImage = styled('img')({
  width: '80%',
  height: 'auto'
})

const TangledArrowContainer = styled('div')({
  display: 'none',
  margin: '48px auto 0px auto',
  [mobileBreakpoint]: {
    width: 76,
    display: 'block'
  }
})

const Message = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  textAlign: 'center',
  lineHeight: '20px',
  margin: '24 0'
})

interface Props {
  isReadOnly?: boolean
  allowTasks: boolean
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isReadOnly, allowTasks} = props
  const readOnlyMessage = allowTasks
    ? 'No comments or tasks were added here'
    : 'No comments were added here'
  const message = `Start the conversation${
    allowTasks ? ' or add takeaway task cards' : ''
  } to capture next steps.`
  const src = EmptyDiscussionIllustration

  return (
    <DiscussionThreadEmptyStateRoot>
      <EmptyDiscussionContainer>
        <EmptyDiscussionImage src={src} />
      </EmptyDiscussionContainer>
      <Message>{isReadOnly ? readOnlyMessage : message}</Message>
      {!isReadOnly && (
        <TangledArrowContainer>
          <TangledArrowSVG />
        </TangledArrowContainer>
      )}
    </DiscussionThreadEmptyStateRoot>
  )
}

export default DiscussionThreadListEmptyState
