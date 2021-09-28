import React, {Ref, useEffect, useRef} from 'react'
import styled from '@emotion/styled'
import {usePollContext} from './PollContext'
import {PALETTE} from '../../styles/paletteV3'
import {Polls, PollsAriaLabels} from '../../types/constEnums'

interface Props {
  id: string
  value: string
  placeholder: string | null
  shouldAutoFocus: boolean | null
}

const PollOptionInputRoot = styled('div')({
  position: 'relative',
  width: '100%',
  height: '36px',
  display: 'flex',
  alignItems: 'center'
})

const Input = styled('input')({
  width: '100%',
  padding: `8px 12px`,
  fontSize: '14px',
  color: PALETTE.SLATE_900,
  borderRadius: '7px',
  border: `1.5px solid ${PALETTE.SLATE_400}`,
  ':hover, :focus, :active': {
    outline: `none`,
    border: `1.5px solid ${PALETTE.SKY_500}`
  }
})

const Counter = styled('div')<{
  isVisible: boolean
  isMax: boolean
}>(({isVisible, isMax}) => ({
  display: isVisible ? 'block' : 'none',
  position: 'absolute',
  top: '0',
  right: '0',
  margin: '2px 6px',
  fontSize: '10px',
  color: isMax ? PALETTE.TOMATO_500 : PALETTE.SLATE_600
}))

const PollOptionInput = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {id, value, placeholder, shouldAutoFocus} = props
  const {updatePollOption} = usePollContext()
  const pollInputRef = useRef<HTMLInputElement>(null)
  const [isCounterVisible, setIsCounterVisible] = React.useState(false)
  const handlePollOptionUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePollOption(id, event.target.value)
  }
  const inputValue = value ?? ''
  const hasReachedMaxValue = inputValue.length >= Polls.MAX_OPTION_TITLE_LENGTH
  const showCounter = () => {
    setIsCounterVisible(true)
  }
  const hideCounter = () => {
    setIsCounterVisible(false)
  }

  useEffect(() => {
    if (shouldAutoFocus && pollInputRef.current) {
      pollInputRef.current.focus()
    }
  }, [shouldAutoFocus])

  return (
    <PollOptionInputRoot ref={ref}>
      <Input
        ref={pollInputRef}
        aria-label={PollsAriaLabels.POLL_OPTION_EDITOR}
        data-cy='poll-option-input'
        placeholder={placeholder ?? ''}
        value={value}
        onChange={handlePollOptionUpdate}
        maxLength={Polls.MAX_OPTION_TITLE_LENGTH}
        onFocus={showCounter}
        onBlur={hideCounter}
      />
      <Counter isVisible={isCounterVisible} isMax={hasReachedMaxValue}>
        {inputValue.length}/{Polls.MAX_OPTION_TITLE_LENGTH}
      </Counter>
    </PollOptionInputRoot>
  )
})

export default PollOptionInput
