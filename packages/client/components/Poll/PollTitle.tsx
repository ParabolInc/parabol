import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {useFragment} from 'react-relay'
import {PollTitle_poll$key} from '../../__generated__/PollTitle_poll.graphql'

const PollTitleHeader = styled('div')({
  padding: `10px 12px 0px 12px`,
  fontSize: '14px'
})

interface Props {
  poll: PollTitle_poll$key
}

const PollTitle = (props: Props) => {
  const {poll: pollRef} = props
  const poll = useFragment(
    graphql`
      fragment PollTitle_poll on Poll {
        title
      }
    `,
    pollRef
  )

  return <PollTitleHeader>{poll.title}</PollTitleHeader>
}

export default PollTitle
