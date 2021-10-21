import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {ThreadedPollBase_poll$key} from '~/__generated__/ThreadedPollBase_poll.graphql'
import {ThreadedPollBase_discussion$key} from '~/__generated__/ThreadedPollBase_discussion.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import Poll from './Poll/Poll'
import PollTitle from './Poll/PollTitle'
import useAtmosphere from '../hooks/useAtmosphere'
import {addLocalPollOption} from './Poll/local/newPoll'
import CreatePollMutation from '../mutations/CreatePollMutation'
import {Polls, PollsAriaLabels} from '../types/constEnums'
import {getPollState} from './Poll/PollState'
import styled from '@emotion/styled'
import PollOption from './Poll/PollOption'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '../styles/paletteV3'
import {AddPollOptionButton} from './Poll/AddPollOptionButton'
import EditablePollTitle from './Poll/EditablePollTitle'
import EditablePollOption from './Poll/EditablePollOption'

const PollOptions = styled('div')({
  fontSize: '14px',
  padding: `12px 12px 0px 12px`,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
})

const PollActions = styled('div')({
  width: '100%',
  padding: `0px 12px 12px 12px`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const StartPollButton = styled(PlainButton)({
  padding: `8px 24px`,
  fontSize: '14px',
  fontWeight: 500,
  background: PALETTE.SKY_500,
  outline: 'none',
  color: PALETTE.WHITE,
  border: 'none',
  borderRadius: '24px',
  cursor: 'pointer',
  ':hover,:focus': {
    background: PALETTE.SKY_600
  },
  marginLeft: 'auto'
})

const SubmitVoteButton = styled(PlainButton)({
  padding: `8px 24px`,
  marginTop: '12px',
  fontSize: '14px',
  fontWeight: 500,
  background: PALETTE.SLATE_300,
  color: PALETTE.SLATE_700,
  border: 'none',
  borderRadius: '24px',
  ':hover': {
    background: PALETTE.SLATE_400
  }
})

const StartPollWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '12px'
})

interface Props {
  allowedThreadables: DiscussionThreadables[]
  poll: ThreadedPollBase_poll$key
  discussion: ThreadedPollBase_discussion$key
}

const ThreadedPollBase = (props: Props) => {
  const {poll: pollRef, discussion: discussionRef} = props
  const poll = useFragment(
    graphql`
      fragment ThreadedPollBase_poll on Poll {
        ...Poll_poll
        ...EditablePollTitle_poll
        ...PollTitle_poll
        id
        title
        updatedAt
        threadSortOrder
        options {
          ...EditablePollOption_option
          ...PollOption_option
          id
          title
        }
      }
    `,
    pollRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedPollBase_discussion on Discussion {
        id
      }
    `,
    discussionRef
  )

  const atmosphere = useAtmosphere()
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const addPollOption = () => {
    addLocalPollOption(atmosphere, poll.id)
  }
  const createPoll = () => {
    CreatePollMutation(
      atmosphere,
      {
        newPoll: {
          discussionId: discussion.id,
          title: poll.title,
          threadSortOrder: poll.threadSortOrder!,
          options: poll.options
            .filter((option) => option.title.length > 0) // option 3 and 4 might be empty
            .map((option) => {
              return {title: option.title}
            })
        }
      },
      {localPoll: poll}
    )
  }
  const {id, title, options} = poll
  const pollState = getPollState(id)
  const isTitleValid = title.length >= Polls.MIN_TITLE_LENGTH
  const hasAtLeastTwoValidOptions =
    options.filter(({title}) => title.length >= Polls.MIN_OPTION_TITLE_LENGTH).length > 1
  const isEveryOptionValid =
    options.length >= Polls.MIN_OPTIONS &&
    options.length <= Polls.MAX_OPTIONS &&
    hasAtLeastTwoValidOptions
  const canCreatePoll = pollState === 'creating' && isTitleValid && isEveryOptionValid
  const submitVote = () => {
    //TODO: fire submit vote mutation
  }
  const renderPoll = () => {
    if (pollState === 'creating') {
      return (
        <>
          <EditablePollTitle poll={poll} />
          <PollOptions>
            {poll.options.map((option, index) => {
              const isLastOption = index === poll.options.length - 1
              const isOptional = index > 1

              return (
                <EditablePollOption
                  key={option.id}
                  shouldAutoFocus={isOptional && isLastOption}
                  placeholder={`Add a choice ${index + 1} ${isOptional ? '(optional)' : ''}...`}
                  option={option}
                />
              )
            })}
          </PollOptions>
          <PollActions>
            <StartPollWrapper>
              {poll.options.length < Polls.MAX_OPTIONS && (
                <AddPollOptionButton onClick={addPollOption} />
              )}
              <StartPollButton
                aria-label={PollsAriaLabels.POLL_START}
                onClick={createPoll}
                disabled={!canCreatePoll}
              >
                Start
              </StartPollButton>
            </StartPollWrapper>
          </PollActions>
        </>
      )
    }

    return (
      <>
        <PollTitle poll={poll} />
        <PollOptions>
          {poll.options.map((option) => {
            return <PollOption key={option.id} onSelected={setSelectedOptionId} option={option} />
          })}
        </PollOptions>
        <PollActions>
          {selectedOptionId && (
            <SubmitVoteButton aria-label={PollsAriaLabels.POLL_SUBMIT_VOTE} onClick={submitVote}>
              Submit and view results
            </SubmitVoteButton>
          )}
        </PollActions>
      </>
    )
  }

  return <Poll poll={poll}>{renderPoll()}</Poll>
}

export default ThreadedPollBase
