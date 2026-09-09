import {cn} from '../../ui/cn'
import Avatar from '../Avatar/Avatar'

interface Respondent {
  userId: string
  preferredName: string
  picture: string
}

interface Props {
  // the users who have submitted at least one response
  respondentUserIds: ReadonlyArray<string>
  // everyone expected to respond (spectators excluded)
  respondents: ReadonlyArray<Respondent>
  className?: string
}

// beyond this the row wraps into a wall of faces, so the rest collapse into a +N chip
const MAX_AVATARS = 8

// a face lights up once that person has answered, so the team knows who still owes a response.
// Only that they answered is ever shown, never what they answered
const TeamHealthProgress = (props: Props) => {
  const {respondentUserIds, respondents, className} = props
  const total = respondents.length
  const votedUserIds = new Set(respondentUserIds)
  // the teammates still owed a response sort to the front, where the avatar row never truncates
  const sortedRespondents = [...respondents].sort(
    (a, b) => Number(votedUserIds.has(a.userId)) - Number(votedUserIds.has(b.userId))
  )
  const shownRespondents = sortedRespondents.slice(0, MAX_AVATARS)
  const overflowCount = total - shownRespondents.length
  const respondentCount = respondents.filter((r) => votedUserIds.has(r.userId)).length
  const percentComplete = total === 0 ? 0 : Math.min(100, (respondentCount / total) * 100)
  return (
    <div className={cn('flex w-full flex-col items-center gap-3', className)}>
      {total > 0 && (
        <div className='-space-x-2 flex'>
          {shownRespondents.map((respondent) => (
            <Avatar
              key={respondent.userId}
              picture={respondent.picture}
              alt={
                votedUserIds.has(respondent.userId)
                  ? `${respondent.preferredName} voted`
                  : `${respondent.preferredName} has not voted yet`
              }
              // the ring reads as a gap between overlapping avatars, so it tracks the card behind
              className={cn(
                'size-8 border-2 border-surface-card',
                !votedUserIds.has(respondent.userId) && 'opacity-40 grayscale'
              )}
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
