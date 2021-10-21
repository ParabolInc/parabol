import React from 'react'
import styled from '@emotion/styled'
import {PollOption_option$key} from '../../__generated__/PollOption_option.graphql'
import {PALETTE} from '~/styles/paletteV3'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

interface Props {
  option: PollOption_option$key
  onSelected: (optionId: string) => void
}

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
  const {option: optionRef, onSelected} = props
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

  const {id, title} = pollOption
  return <PollOptionTitle onClick={() => onSelected(id)}>{title}</PollOptionTitle>
}

export default PollOption
