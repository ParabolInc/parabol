import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import isAndroid from '../utils/draftjs/isAndroid'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

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
  isSubmitDisabled: boolean
}

const SendCommentButton = (props: Props) => {
  const {commentSubmitState, onSubmit, dataCy, isSubmitDisabled} = props
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.LOWER_CENTER)

  const androidCommentSubmitState = isSubmitDisabled ? 'typing' : 'idle'

  useEffect(() => {
    const btn = document.querySelector('.send-comment-button')
    const submitListener = () => {
      if (isAndroid) {
        btn?.addEventListener('touchend', (e) => {
          e.preventDefault()
          onSubmit()
        })
      } else {
        onSubmit()
      }
    }
    btn?.addEventListener('click', submitListener, true)
    return () => {
      btn?.removeEventListener('click', submitListener, true)
    }
  }, [onSubmit])

  return (
    <>
      <StyledPlainButton
        data-cy={`${dataCy}-send`}
        className='send-comment-button'
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        commentSubmitState={isAndroid ? androidCommentSubmitState : commentSubmitState}
        disabled={!isSubmitDisabled}
        ref={tipRef}
      >
        <SendIcon commentSubmitState={isAndroid ? androidCommentSubmitState : commentSubmitState}>
          arrow_upward
        </SendIcon>
      </StyledPlainButton>
      {tooltipPortal(<div>{'Send comment'}</div>)}
    </>
  )
}

export default SendCommentButton
