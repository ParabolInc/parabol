import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ThreadedCommentFooter_reactjis$key} from '~/__generated__/ThreadedCommentFooter_reactjis.graphql'
import ReactjiSection from './ReflectionCard/ReactjiSection'
import ThreadedReplyButton from './ThreadedReplyButton'

interface Props {
  onReply: () => void
  onToggleReactji: (emojiId: string) => void
  reactjis: ThreadedCommentFooter_reactjis$key
}

const ThreadedCommentFooter = (props: Props) => {
  const {onReply, onToggleReactji, reactjis: reactjisRef} = props
  const reactjis = useFragment(
    graphql`
      fragment ThreadedCommentFooter_reactjis on Reactji @relay(plural: true) {
        ...ReactjiSection_reactjis
        id
      }
    `,
    reactjisRef
  )
  const hasReactjis = reactjis.length > 0
  if (!hasReactjis) return null
  return (
    <div className='flex items-center pr-3 font-semibold text-fg-secondary text-xs'>
      <ThreadedReplyButton onReply={onReply} />
      <ReactjiSection className='pl-2' reactjis={reactjis} onToggle={onToggleReactji} />
    </div>
  )
}

export default ThreadedCommentFooter
