import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {PollTitle_poll$key} from '../../__generated__/PollTitle_poll.graphql'

interface Props {
  pollRef: PollTitle_poll$key
}

const PollTitle = (props: Props) => {
  const {pollRef} = props
  const poll = useFragment(
    graphql`
      fragment PollTitle_poll on Poll {
        title
      }
    `,
    pollRef
  )

  return <div className='px-3 pt-[10px] text-[14px]'>{poll.title}</div>
}

export default PollTitle
