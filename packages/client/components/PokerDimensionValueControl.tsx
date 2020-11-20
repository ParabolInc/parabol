import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV2'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import PokerSetFinalScoreMutation from '../mutations/PokerSetFinalScoreMutation'
import {PokerDimensionValueControl_stage} from '../__generated__/PokerDimensionValueControl_stage.graphql'
import LinkButton from './LinkButton'
import MiniPokerCard from './MiniPokerCard'
import StyledError from './StyledError'

const ControlWrap = styled('div')({
  padding: '0 8px'
})

const Control = styled('div')<{hasFocus: boolean}>(({hasFocus}) => ({
  alignItems: 'center',
  backgroundColor: hasFocus ? 'white' : 'rgba(255, 255, 255, .75)',
  border: '2px solid',
  borderColor: hasFocus ? PALETTE.TEXT_BLUE : 'transparent',
  borderRadius: 4,
  cursor: 'pointer',
  display: 'flex',
  padding: 6
}))

const Input = styled('input')<{color?: string}>(({color}) => ({
  background: 'none',
  border: 0,
  color: color || PALETTE.TEXT_MAIN,
  display: 'block',
  fontSize: 18,
  fontWeight: 600,
  lineHeight: '24px',
  outline: 0,
  textAlign: 'center',
  width: '100%',
  '::placeholder': {
    // color: hasFocus ? 'rgba(125, 125, 125, 125, .25' : 'rgba(125, 125, 125, .5)'
    color: 'rgba(125, 125, 125, .25)'
  }
}))

const Label = styled('label')({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  margin: '0 0 0 16px',
  padding: 0
})

const StyledLinkButton = styled(LinkButton)({
  fontSize: 14,
  fontWeight: 600,
  height: 40,
  margin: '0 0 0 8px',
  padding: '0 8px'
})

const ErrorMessage = styled(StyledError)({
  paddingLeft: 8
})
interface Props {
  placeholder: string
  stage: PokerDimensionValueControl_stage
}

const PokerDimensionValueControl = (props: Props) => {
  const {placeholder, stage} = props
  const {id: stageId, dimension, finalScore, meetingId} = stage
  const {selectedScale} = dimension
  const {values: scaleValues} = selectedScale
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasFocus, setFocus] = useState(!finalScore)
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, error, onError, onCompleted} = useMutationProps()
  const [pendingScore, setPendingScore] = useState(finalScore || '')
  useEffect(() => {
    if (error) {
      setPendingScore(finalScore || '')
    }
  }, [error])
  console.log({error})
  const submitScore = () => {
    if (submitting || finalScore === pendingScore) return
    submitMutation()
    PokerSetFinalScoreMutation(atmosphere, {finalScore: pendingScore, meetingId, stageId}, {onError, onCompleted})
  }
  const focusInput = () => {
    inputRef.current?.focus()
  }
  const onFocus = () => {
    setFocus(true)
  }
  const onBlur = () => {
    setFocus(false)
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setPendingScore(value)
  }

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const {value} = e.currentTarget
      if (!value) return
      submitScore()
      onBlur()
    }
  }
  const matchingScale = scaleValues.find((scaleValue) => scaleValue.label === pendingScore)
  const scaleColor = matchingScale?.color
  const textColor = scaleColor ? '#fff' : undefined
  return (
    <ControlWrap>
      <Control hasFocus={hasFocus}>
        <MiniPokerCard color={scaleColor}>
          <Input onKeyPress={onKeyPress} autoFocus={!finalScore} color={textColor} ref={inputRef} onChange={onChange} placeholder={placeholder} onFocus={onFocus} onBlur={onBlur} value={pendingScore}></Input>
        </MiniPokerCard>
        {hasFocus ?
          <StyledLinkButton palette={'blue'}>{'Update'}</StyledLinkButton> :
          <Label onClick={focusInput}>{'Edit Final Score'}</Label>
        }
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </Control>
    </ControlWrap>
  )
}

export default createFragmentContainer(
  PokerDimensionValueControl,
  {
    stage: graphql`
    fragment PokerDimensionValueControl_stage on EstimateStage {
      id
      meetingId
      finalScore
      dimension {
        selectedScale {
          values {
            label
            color
          }
        }
      }
    }`
  }
)
