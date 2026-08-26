import {Lock} from '~/ui/icons'
import plural from '../../utils/plural'

interface Props {
  respondentCount: number
  minRespondentCount: number
}

// A cycle that closes under the floor never reveals: the answers are still in, but publishing a
// mean over one or two people hands the team those people's answers. Say that plainly rather than
// showing an empty results page.
const TeamHealthWithheldResults = (props: Props) => {
  const {respondentCount, minRespondentCount} = props
  return (
    <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6'>
      <div className='flex w-full flex-col items-center rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-well'>
          <Lock className='text-fg-secondary' />
        </div>
        <h1 className='mt-6 font-bold text-3xl text-fg-primary'>Results stay sealed</h1>
        <p className='mt-2 text-fg-secondary'>
          {respondentCount} {plural(respondentCount, 'teammate')} answered this cycle. It takes{' '}
          {minRespondentCount} before an average stops being one person's answers in disguise, so
          this cycle's results are never shown — to anyone, including the meeting owner.
        </p>
        <p className='mt-4 text-fg-muted text-sm'>
          Nothing is lost: the next cycle starts fresh, and answers from this one are never
          published.
        </p>
      </div>
    </div>
  )
}

export default TeamHealthWithheldResults
