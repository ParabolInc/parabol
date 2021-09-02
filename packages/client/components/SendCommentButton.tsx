import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import useTooltip from '../hooks/useTooltip'
import {MenuPosition} from '../hooks/useCoords'

export type CommentSubmitState = 'idle' | 'typing'

const StyledPlainButton = styled(PlainButton)<{commentSubmitState: CommentSubmitState}>(
  ({commentSubmitState}) => ({
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
  })
)

const SendIcon = styled(Icon)<{commentSubmitState: CommentSubmitState}>(({commentSubmitState}) => ({
  opacity: 1,
  transition: 'color 0.1s ease',
  color: commentSubmitState === 'idle' ? PALETTE.SLATE_500 : PALETTE.WHITE,
  fontSize: 20,
  padding: 4
}))

interface Props {
  commentSubmitState: CommentSubmitState
  onSubmit: () => void
  dataCy: string
}

const SendCommentButton = (props: Props) => {
  const {commentSubmitState, onSubmit, dataCy} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<
    HTMLButtonElement
  >(MenuPosition.LOWER_CENTER)
  const isDisabled = commentSubmitState === 'idle'
  return (
    <>
      <StyledPlainButton
        data-cy={`${dataCy}-send`}
        onClick={onSubmit}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        commentSubmitState={commentSubmitState}
        disabled={isDisabled}
        ref={tipRef}
      >
        <SendIcon commentSubmitState={commentSubmitState}>arrow_upward</SendIcon>
      </StyledPlainButton>
      {tooltipPortal(<div>{'Send comment'}</div>)}
    </>
  )
}

export default SendCommentButton
