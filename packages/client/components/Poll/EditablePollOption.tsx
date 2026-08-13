import graphql from 'babel-plugin-relay/macro'
import * as React from 'react'
import {useFragment} from 'react-relay'
import type {EditablePollOption_option$key} from '../../__generated__/EditablePollOption_option.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Polls, PollsAriaLabels} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import {updateLocalPollOption} from './local/newPoll'

interface Props {
  optionRef: EditablePollOption_option$key
  shouldAutoFocus: boolean
  placeholder: string
}

const EditablePollOption = (props: Props) => {
  const {optionRef, shouldAutoFocus, placeholder} = props
  const pollOption = useFragment(
    graphql`
      fragment EditablePollOption_option on PollOption {
        id
        title
      }
    `,
    optionRef
  )

  const {id, title} = pollOption
  const atmosphere = useAtmosphere()
  const [isCounterVisible, setIsCounterVisible] = React.useState(false)
  const handlePollOptionUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateLocalPollOption(atmosphere, id, event.target.value)
  }
  const showCounter = () => {
    setIsCounterVisible(true)
  }
  const hideCounter = () => {
    setIsCounterVisible(false)
  }

  return (
    <div className='relative flex h-9 w-full items-center'>
      <input
        className='w-full rounded-[7px] border-[1.5px] border-hairline-field border-solid px-3 py-2 text-[14px] text-fg-primary hover:border-accent hover:outline-none focus:border-accent focus:outline-none active:border-accent active:outline-none'
        aria-label={PollsAriaLabels.POLL_OPTION_EDITOR}
        placeholder={placeholder}
        value={title}
        onChange={handlePollOptionUpdate}
        maxLength={Polls.MAX_OPTION_TITLE_LENGTH}
        onFocus={showCounter}
        onBlur={hideCounter}
        autoFocus={shouldAutoFocus}
      />
      <div
        className={cn(
          'absolute top-0 right-0 mx-1.5 my-0.5 text-[10px]',
          title.length >= Polls.MAX_OPTION_TITLE_LENGTH ? 'text-fg-error' : 'text-fg-secondary',
          !isCounterVisible && 'hidden'
        )}
      >
        {title.length}/{Polls.MAX_OPTION_TITLE_LENGTH}
      </div>
    </div>
  )
}

export default EditablePollOption
