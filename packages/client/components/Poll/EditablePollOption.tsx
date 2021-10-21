import React from 'react'
import {EditablePollOption_option$key} from '../../__generated__/EditablePollOption_option.graphql'
import PollOptionInput from './PollOptionInput'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

interface Props {
  option: EditablePollOption_option$key
  shouldAutoFocus: boolean
  placeholder: string
}

const EditablePollOption = (props: Props) => {
  const {option: optionRef, shouldAutoFocus, placeholder} = props
  const pollOption = useFragment(
    graphql`
      fragment EditablePollOption_option on PollOption {
        pollId
        id
        title
      }
    `,
    optionRef
  )

  const {id, title} = pollOption

  return (
    <PollOptionInput
      id={id}
      placeholder={placeholder}
      value={title}
      shouldAutoFocus={shouldAutoFocus}
    />
  )
}

export default EditablePollOption
