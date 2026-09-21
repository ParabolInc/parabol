import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ThreadedCommentFooter_reactjis$key} from '~/__generated__/ThreadedCommentFooter_reactjis.graphql'
import {cn} from '../ui/cn'
import ReactjiSection from './ReflectionCard/ReactjiSection'
import ThreadedReplyButton from './ThreadedReplyButton'

interface Props {
  isReadOnly: boolean
  onReply: () => void
  onToggleReactji: (emojiId: string) => void
  reactjis: ThreadedCommentFooter_reactjis$key
}

const ThreadedCommentFooter = (props: Props) => {
  const {isReadOnly, onReply, onToggleReactji, reactjis: reactjisRef} = props
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
      {!isReadOnly && <ThreadedReplyButton onReply={onReply} />}
      <ReactjiSection
        className={cn(!isReadOnly && 'pl-2')}
        reactjis={reactjis}
        onToggle={isReadOnly ? undefined : onToggleReactji}
      />
    </div>
  )
}

export default ThreadedCommentFooter
