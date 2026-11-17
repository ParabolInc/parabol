import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {ThreadedPollBase_discussion$key} from '~/__generated__/ThreadedPollBase_discussion.graphql'
import type {ThreadedPollBase_poll$key} from '~/__generated__/ThreadedPollBase_poll.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import CreatePollMutation from '../mutations/CreatePollMutation'
import {Polls, PollsAriaLabels} from '../types/constEnums'
import type {DiscussionThreadables} from './DiscussionThreadList'
import PlainButton from './PlainButton/PlainButton'
import {AddPollOptionButton} from './Poll/AddPollOptionButton'
import EditablePollOption from './Poll/EditablePollOption'
import EditablePollTitle from './Poll/EditablePollTitle'
import {addLocalPollOption} from './Poll/local/newPoll'
import Poll from './Poll/Poll'
import PollOption from './Poll/PollOption'
import {getPollState} from './Poll/PollState'
import PollTitle from './Poll/PollTitle'

const pollOptionsClassName = 'flex flex-col gap-2 px-3 pt-3 text-[14px]'
const pollActionsClassName = 'flex w-full items-center justify-center px-3 pb-3'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  pollRef: ThreadedPollBase_poll$key
  discussionRef: ThreadedPollBase_discussion$key
}

const ThreadedPollBase = (props: Props) => {
  const {pollRef, discussionRef} = props
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
  const [isTitleFocused, setIsTitleFocused] = useState(false)
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
          <EditablePollTitle
            pollRef={poll}
            onFocus={() => setIsTitleFocused(true)}
            onBlur={() => setIsTitleFocused(false)}
          />
          <div className={pollOptionsClassName}>
            {poll.options.map((option, index) => {
              const isLastOption = index === poll.options.length - 1
              const isOptional = index > 1

              return (
                <EditablePollOption
                  key={option.id}
                  shouldAutoFocus={isOptional && isLastOption}
                  placeholder={`Add a choice ${index + 1} ${isOptional ? '(optional)' : ''}...`}
                  optionRef={option}
                />
              )
            })}
          </div>
          <div className={pollActionsClassName}>
            <div className='mt-3 flex w-full items-center justify-center'>
              {poll.options.length < Polls.MAX_OPTIONS && (
                <AddPollOptionButton onClick={addPollOption} />
              )}
              <PlainButton
                className='ml-auto cursor-pointer rounded-md border-none bg-sky-500 px-6 py-2 font-medium text-[14px] text-white outline-none hover:bg-sky-600 focus:bg-sky-600'
                aria-label={PollsAriaLabels.POLL_START}
                onClick={createPoll}
                disabled={!canCreatePoll}
              >
                Start
              </PlainButton>
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <PollTitle pollRef={poll} />
        <div className={pollOptionsClassName}>
          {poll.options.map((option) => {
            return (
              <PollOption key={option.id} onSelected={setSelectedOptionId} optionRef={option} />
            )
          })}
        </div>
        <div className={pollActionsClassName}>
          {selectedOptionId && (
            <PlainButton
              className='mt-3 rounded-md border-none bg-surface-well px-6 py-2 font-medium text-[14px] text-fg-primary hover:bg-surface-hover'
              aria-label={PollsAriaLabels.POLL_SUBMIT_VOTE}
              onClick={submitVote}
            >
              Submit and view results
            </PlainButton>
          )}
        </div>
      </>
    )
  }

  return (
    <Poll isFocused={isTitleFocused} pollRef={poll}>
      {renderPoll()}
    </Poll>
  )
}

export default ThreadedPollBase
