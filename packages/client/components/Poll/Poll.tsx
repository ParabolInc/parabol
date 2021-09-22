import React, {Ref, useCallback} from 'react'
import styled from '@emotion/styled'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Poll_poll$key} from '~/__generated__/Poll_poll.graphql'
import {Poll_discussion$key} from '~/__generated__/Poll_discussion.graphql'

import {PollContext, PollState} from './PollContext'
import {cardShadow, Elevation} from '~/styles/elevation'
import ThreadedItemWrapper from '../ThreadedItemWrapper'
import ThreadedAvatarColumn from '../ThreadedAvatarColumn'
import ThreadedItemHeaderDescription from '../ThreadedItemHeaderDescription'
import cardRootStyles from '~/styles/helpers/cardRootStyles'
import {PALETTE} from '~/styles/paletteV3'
import {updateLocalPollOption, addLocalPollOption, updateLocalPoll} from './local/newPoll'
import useAtmosphere from '~/hooks/useAtmosphere'
import CreatePollMutation from '~/mutations/CreatePollMutation'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%',
  marginTop: 10
})

const PollRoot = styled('div')<{
  pollState: PollState
}>(({pollState}) => ({
  ...cardRootStyles,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  outline: 'none',
  padding: `0`,
  overflow: 'hidden',
  color: PALETTE.SLATE_600,
  backgroundColor: PALETTE.WHITE,
  border: `1px solid ${PALETTE.SLATE_400}`,
  boxShadow: pollState === 'creating' ? cardShadow : Elevation.Z0
}))

interface Props {
  children: React.ReactNode
  poll: Poll_poll$key
  discussion: Poll_discussion$key
  dataCy: string
}

const Poll = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {dataCy, poll: pollRef, discussion: discussionRef, children} = props
  const poll = useFragment(
    graphql`
      fragment Poll_poll on Poll {
        id
        title
        createdBy
        createdByUser {
          id
          preferredName
          picture
        }
        threadSortOrder
        options {
          id
          title
          placeholder
        }
      }
    `,
    pollRef
  )
  const discussion = useFragment(
    graphql`
      fragment Poll_discussion on Discussion {
        id
      }
    `,
    discussionRef
  )
  const atmosphere = useAtmosphere()

  // TODO fixme, should not be nullable
  const {picture, preferredName} = poll.createdByUser!
  const [selectedOptionId, setSelectedOptionId] = React.useState<string>('')
  const onOptionSelected = React.useCallback((optionId: string) => {
    setSelectedOptionId(optionId)
  }, [])
  const updatePollOption = useCallback(
    (id: string, updatedValue: string) => {
      updateLocalPollOption(atmosphere, id, updatedValue)
    },
    [atmosphere]
  )
  const updatePoll = useCallback(
    (id: string, updatedTitle: string) => {
      updateLocalPoll(atmosphere, id, updatedTitle)
    },
    [atmosphere]
  )
  const addPollOption = useCallback(() => {
    addLocalPollOption(atmosphere, poll.id, poll.options.length + 1)
  }, [atmosphere, poll])
  const createPoll = useCallback(() => {
    CreatePollMutation(
      atmosphere,
      {
        newPoll: {
          discussionId: discussion.id,
          title: poll.title,
          threadSortOrder: poll.threadSortOrder!,
          options: poll.options.map((option) => {
            return {title: option.title}
          })
        }
      },
      {localPoll: poll}
    )
  }, [atmosphere, poll, discussion])
  const pollContextValue = React.useMemo(
    () =>
      ({
        pollState: poll.id.includes('tmp') ? 'creating' : 'created',
        poll,
        onOptionSelected,
        selectedOptionId,
        updatePoll,
        updatePollOption,
        createPoll,
        addPollOption
      } as const),
    [onOptionSelected, selectedOptionId, poll, updatePollOption, createPoll, addPollOption]
  )

  return (
    <PollContext.Provider value={pollContextValue}>
      <ThreadedItemWrapper data-cy={`${dataCy}-wrapper`} isReply={false} ref={ref}>
        <ThreadedAvatarColumn isReply={false} picture={picture} />
        <BodyCol>
          <ThreadedItemHeaderDescription
            title={preferredName}
            subTitle={
              pollContextValue.pollState === 'creating' ? 'is creating a Poll...' : 'added a Poll'
            }
          />
          <PollRoot ref={ref} pollState={pollContextValue.pollState}>
            {children}
          </PollRoot>
        </BodyCol>
      </ThreadedItemWrapper>
    </PollContext.Provider>
  )
})

export default Poll
