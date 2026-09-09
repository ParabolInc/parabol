import {cn} from '../../ui/cn'
import Avatar from '../Avatar/Avatar'

interface Respondent {
  userId: string
  preferredName: string
  picture: string
}

interface Props {
  // number of members who have submitted at least one response
  respondentCount: number
  // everyone expected to respond (spectators excluded)
  respondents: ReadonlyArray<Respondent>
  className?: string
}

// beyond this the row wraps into a wall of faces, so the rest collapse into a +N chip
const MAX_AVATARS = 8

// the faces are everyone we're waiting on, in no particular order, and the count is a bare tally.
// Never mark which face has answered: with one response in, that would name the respondent
const TeamHealthProgress = (props: Props) => {
  const {respondentCount, respondents, className} = props
  const total = respondents.length
  const shownRespondents = respondents.slice(0, MAX_AVATARS)
  const overflowCount = total - shownRespondents.length
  const percentComplete = total === 0 ? 0 : Math.min(100, (respondentCount / total) * 100)
  return (
    <div className={cn('flex w-full flex-col items-center gap-3', className)}>
      {total > 0 && (
        <div className='-space-x-2 flex'>
          {shownRespondents.map((respondent) => (
            <Avatar
              key={respondent.userId}
              picture={respondent.picture}
              alt={respondent.preferredName}
              // the ring reads as a gap between overlapping avatars, so it tracks the card behind
              className='size-8 border-2 border-surface-card'
            />
          ))}
          {overflowCount > 0 && (
            <div className='flex size-8 items-center justify-center rounded-full border-2 border-surface-card bg-surface-well font-semibold text-fg-secondary text-xs'>
              {`+${overflowCount}`}
            </div>
          )}
        </div>
      )}
      <div className='h-1.5 w-full max-w-64 overflow-hidden rounded-full bg-surface-well'>
        <div
          className='h-full rounded-full bg-jade-500 transition-[width]'
          style={{width: `${percentComplete}%`}}
        />
      </div>
      <div className='font-semibold text-fg-secondary'>
        {respondentCount} of {total} teammates voted
      </div>
    </div>
  )
}

export default TeamHealthProgress
