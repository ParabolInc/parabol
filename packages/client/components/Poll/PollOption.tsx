import React from 'react'
import styled from '@emotion/styled'
import {PollOption_option$key} from '../../__generated__/PollOption_option.graphql'
import {PALETTE} from '~/styles/paletteV3'
import PollOptionInput from './PollOptionInput'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {getPollState} from './PollState'

interface Props {
  option: PollOption_option$key
  onOptionSelected: (optionId: string) => void
  shouldAutoFocus: boolean
  placeholder: string
}

const PollOptionRoot = styled('div')({
  width: '100%'
})

const PollOptionTitle = styled('div')({
  width: '100%',
  height: '36px',
  fontSize: '14px',
  padding: `0 12px`,
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '18px',
  display: 'flex',
  alignItems: 'center'
})

const PollOption = (props: Props) => {
  const {option: optionRef, onOptionSelected, shouldAutoFocus, placeholder} = props
  const pollOption = useFragment(
    graphql`
      fragment PollOption_option on PollOption {
        pollId
        id
        title
      }
    `,
    optionRef
  )

  const pollState = getPollState(pollOption.pollId)
  const {id, title} = pollOption

  const renderPollOption = () => {
    if (pollState === 'creating') {
      return (
        <PollOptionInput
          id={id}
          placeholder={placeholder}
          value={title}
          shouldAutoFocus={shouldAutoFocus}
        />
      )
    }

    return <PollOptionTitle onClick={() => onOptionSelected(id)}>{title}</PollOptionTitle>
  }

  return <PollOptionRoot>{renderPollOption()}</PollOptionRoot>
}

export default PollOption
