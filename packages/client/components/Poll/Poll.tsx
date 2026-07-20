import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useFragment} from 'react-relay'
import type {Poll_poll$key} from '~/__generated__/Poll_poll.graphql'
import {cn} from '~/ui/cn'
import ThreadedAvatarColumn from '../ThreadedAvatarColumn'
import ThreadedItemHeaderDescription from '../ThreadedItemHeaderDescription'
import ThreadedItemWrapper from '../ThreadedItemWrapper'
import {getPollState} from './PollState'

interface Props {
  children: React.ReactNode
  pollRef: Poll_poll$key
  isFocused: boolean
}

const Poll = (props: Props) => {
  const {pollRef, children, isFocused} = props
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
      <div className='mt-2.5 flex w-full flex-col pb-2'>
        <ThreadedItemHeaderDescription
          title={preferredName}
          subTitle={isNewPoll ? 'is creating a Poll...' : 'added a Poll'}
        />
        <div
          className={cn(
            'flex w-full flex-col justify-start overflow-hidden rounded bg-surface-card text-fg-secondary outline-none transition-shadow duration-100 ease-in',
            isFocused
              ? 'border-[1.5px] border-accent shadow-card'
              : 'border-[1.5px] border-hairline-strong shadow-none'
          )}
        >
          {children}
        </div>
      </div>
    </ThreadedItemWrapper>
  )
}

export default Poll
