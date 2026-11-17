import type {SuggestedGroupsMode} from '../__generated__/useGenerateSuggestedGroupsMutation.graphql'
import useInterval from '../hooks/useInterval'

const MESSAGE_DURATION = 2500

/**
 * Similarity runs locally off embeddings and usually resolves before the first tick, so its first
 * phrase carries the whole wait. AI makes a call per column, which is the run worth narrating.
 */
const MESSAGES: Record<SuggestedGroupsMode, string[]> = {
  similarity: ['Matching wording…', 'Grouping cards…', 'Almost there…'],
  ai: ['Reading the room…', 'Finding themes…', 'Naming groups…', 'Almost there…']
}

type Props = {
  mode: SuggestedGroupsMode
}

/**
 * Mount this only while submitting: useInterval counts from a ref seeded at mount, so mounting is
 * what restarts the sequence for each run. It also stops counting at the last phrase rather than
 * looping, which keeps a 30s AI run from cycling back to "Reading the room…" once it is nearly done.
 */
const SuggestedGroupsProgressLabel = (props: Props) => {
  const {mode} = props
  const messages = MESSAGES[mode]
  const idx = useInterval(MESSAGE_DURATION, messages.length - 1)
  return (
    <>
      <span className='sr-only'>{'Updating suggestions'}</span>
      <span aria-hidden>{messages[idx]}</span>
    </>
  )
}

export default SuggestedGroupsProgressLabel
