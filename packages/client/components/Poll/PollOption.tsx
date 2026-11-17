import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {PollOption_option$key} from '../../__generated__/PollOption_option.graphql'

interface Props {
  optionRef: PollOption_option$key
  onSelected: (optionId: string) => void
}

const PollOption = (props: Props) => {
  const {optionRef, onSelected} = props
  const pollOption = useFragment(
    graphql`
      fragment PollOption_option on PollOption {
        id
        title
      }
    `,
    optionRef
  )

  const {id, title} = pollOption
  return (
    <div
      className='flex h-9 w-full items-center rounded-md border border-hairline-strong px-3 text-[14px]'
      onClick={() => onSelected(id)}
    >
      {title}
    </div>
  )
}

export default PollOption
