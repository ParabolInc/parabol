import React from 'react'
import styled from '@emotion/styled'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Poll_poll$key} from '~/__generated__/Poll_poll.graphql'

import {cardShadow, Elevation} from '~/styles/elevation'
import ThreadedItemWrapper from '../ThreadedItemWrapper'
import ThreadedAvatarColumn from '../ThreadedAvatarColumn'
import ThreadedItemHeaderDescription from '../ThreadedItemHeaderDescription'
import cardRootStyles from '~/styles/helpers/cardRootStyles'
import {PALETTE} from '~/styles/paletteV3'
import {getPollState} from './PollState'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%',
  marginTop: 10
})

const PollCard = styled('div')<{
  isFocused: boolean
}>(({isFocused}) => ({
  ...cardRootStyles,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  outline: 'none',
  padding: `0`,
  overflow: 'hidden',
  color: PALETTE.SLATE_600,
  backgroundColor: PALETTE.WHITE,
  border: `1.5px solid ${isFocused ? PALETTE.SKY_400 : PALETTE.SLATE_400}`,
  boxShadow: isFocused ? cardShadow : Elevation.Z0,
  transition: `box-shadow 100ms ease-in`
}))

interface Props {
  children: React.ReactNode
  poll: Poll_poll$key
}

const Poll = (props: Props) => {
  const {poll: pollRef, children} = props
  const poll = useFragment(
    graphql`
      fragment Poll_poll on Poll {
        id
        createdByUser {
          id
          preferredName
          picture
        }
      }
    `,
    pollRef
  )
  const {
    id,
    createdByUser: {picture, preferredName}
  } = poll
  const pollState = getPollState(id)
  const isNewPoll = pollState === 'creating'

  return (
    <ThreadedItemWrapper isReply={false}>
      <ThreadedAvatarColumn isReply={false} picture={picture} />
      <BodyCol>
        <ThreadedItemHeaderDescription
          title={preferredName}
          subTitle={isNewPoll ? 'is creating a Poll...' : 'added a Poll'}
        />
        <PollCard isFocused={isNewPoll}>{children}</PollCard>
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default Poll
