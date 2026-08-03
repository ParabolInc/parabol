import type {SuggestedGroupsMode} from '../__generated__/useGenerateSuggestedGroupsMutation.graphql'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import SuggestedGroupsProgressLabel from './SuggestedGroupsProgressLabel'

type Props = {
  onSubmit: () => void
  submitting: boolean
  isUpToDate: boolean
  mode: SuggestedGroupsMode
}

// Same 4-stop loop the reflect-phase chits sweep, so a board in progress reads the same everywhere
const SWEEP =
  'animate-gradient-sweep bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--color-grape-500)_0%,var(--color-tomato-500)_33%,var(--color-aqua-400)_66%,var(--color-grape-500)_100%)] motion-reduce:animate-none'

const SuggestedGroupsSubmitButton = (props: Props) => {
  const {onSubmit, submitting, isUpToDate, mode} = props
  return (
    <Button
      variant='dialogPrimary'
      size='md'
      onClick={onSubmit}
      disabled={submitting || isUpToDate}
      aria-busy={submitting}
      className={cn(
        'mt-4 w-full bg-grape-500 hover:bg-grape-600',
        // Still disabled while submitting so a second click cannot fire, but the dimmer baked into
        // the Button base styles would wash the sweep out, so opt back out of it
        submitting && `${SWEEP} disabled:opacity-100`
      )}
    >
      {submitting ? <SuggestedGroupsProgressLabel mode={mode} /> : 'Update suggestions'}
    </Button>
  )
}

export default SuggestedGroupsSubmitButton
