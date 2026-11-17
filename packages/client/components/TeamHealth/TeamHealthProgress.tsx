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
  // who has answered. The server sends an empty list until enough people have responded that
  // naming them can't attribute a response to anyone
  respondentUserIds: ReadonlyArray<string>
  // everyone expected to respond (spectators excluded)
  respondents: ReadonlyArray<Respondent>
  className?: string
}

// beyond this the row wraps into a wall of faces, so the rest collapse into a +N chip
const MAX_AVATARS = 8

const nameListFormatter =
  Intl.ListFormat !== undefined
    ? new Intl.ListFormat('en', {style: 'long', type: 'conjunction'})
    : {format: (names: string[]) => names.join(', ')} // fallback for safari pre Big Sur

const TeamHealthProgress = (props: Props) => {
  const {respondentCount, respondentUserIds, respondents, className} = props
  const total = respondents.length
  const canNameRespondents = respondentUserIds.length > 0
  const votedUserIds = new Set(respondentUserIds)
  // once faces can be named, the teammates still owed a response sort to the front, where the
  // avatar row never truncates
  const sortedRespondents = canNameRespondents
    ? [...respondents].sort(
        (a, b) => Number(votedUserIds.has(a.userId)) - Number(votedUserIds.has(b.userId))
      )
    : respondents
  const shownRespondents = sortedRespondents.slice(0, MAX_AVATARS)
  const pendingNames = canNameRespondents
    ? respondents.filter(({userId}) => !votedUserIds.has(userId)).map((r) => r.preferredName)
    : []
  const overflowCount = total - shownRespondents.length
  const percentComplete = total === 0 ? 0 : Math.min(100, (respondentCount / total) * 100)
  return (
    <div className={cn('flex w-full flex-col items-center gap-3', className)}>
      {total > 0 && (
        <div className='-space-x-2 flex'>
          {shownRespondents.map((respondent) => {
            const isPending = canNameRespondents && !votedUserIds.has(respondent.userId)
            return (
              <Avatar
                key={respondent.userId}
                picture={respondent.picture}
                alt={
                  !canNameRespondents
                    ? respondent.preferredName
                    : isPending
                      ? `${respondent.preferredName} has not voted yet`
                      : `${respondent.preferredName} voted`
                }
                // the ring reads as a gap between overlapping avatars, so it tracks the card behind
                className={cn(
                  'size-8 border-2 border-surface-card',
                  isPending && 'opacity-40 grayscale'
                )}
              />
            )
          })}
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
      {pendingNames.length > 0 && (
        <div className='text-fg-muted text-sm'>
          Still waiting on {nameListFormatter.format(pendingNames)}
        </div>
      )}
    </div>
  )
}

export default TeamHealthProgress
