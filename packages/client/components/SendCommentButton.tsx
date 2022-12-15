import styled from '@emotion/styled'
import {ArrowUpward} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import isAndroid from '~/utils/draftjs/isAndroid'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import PlainButton from './PlainButton/PlainButton'

export type CommentSubmitState = 'idle' | 'typing'

const StyledPlainButton = styled(PlainButton, {
  shouldForwardProp: (prop) => !['commentSubmitState'].includes(prop)
})<{commentSubmitState: CommentSubmitState}>(({commentSubmitState}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: commentSubmitState === 'idle' ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  transition: 'background-color 0.1s ease',
  borderRadius: '100%',
  height: 32,
  width: 32,
  margin: 8,
  ':hover, :focus, :active': {
    backgroundColor: commentSubmitState === 'idle' ? PALETTE.SLATE_200 : PALETTE.SKY_600
  },
  opacity: 1,
  ':hover,:focus': {
    opacity: 1
  }
}))

const SendIcon = styled(ArrowUpward, {
  shouldForwardProp: (prop) => !['commentSubmitState'].includes(prop)
})<{commentSubmitState: CommentSubmitState}>(({commentSubmitState}) => ({
  opacity: 1,
  transition: 'color 0.1s ease',
  color: commentSubmitState === 'idle' ? PALETTE.SLATE_500 : PALETTE.WHITE,
  height: 20,
  width: 20,
  margin: 4
}))

interface Props {
  commentSubmitState: CommentSubmitState
  onSubmit: () => void
  dataCy: string
}

const SendCommentButton = (props: Props) => {
  const {commentSubmitState, onSubmit, dataCy} = props
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.LOWER_CENTER)

  const isDisabled = commentSubmitState === 'idle'

  const handleTouched = (e: React.TouchEvent) => {
    if (!isAndroid) return
    e.preventDefault()
    onSubmit()
  }

  return (
    <>
      <StyledPlainButton
        data-cy={`${dataCy}-send`}
        onClick={onSubmit}
        onTouchEnd={handleTouched}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        commentSubmitState={commentSubmitState}
        disabled={isDisabled}
        ref={tipRef}
      >
        <SendIcon commentSubmitState={commentSubmitState} />
      </StyledPlainButton>
      {tooltipPortal(<div>{'Send comment'}</div>)}
    </>
  )
}

export default SendCommentButton
