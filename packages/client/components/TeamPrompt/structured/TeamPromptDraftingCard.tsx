import {Create} from '~/ui/icons'
import Avatar from '../../Avatar/Avatar'

interface Props {
  preferredName: string
  picture: string
  answeredCount: number
  promptCount: number
  hasStarted: boolean
  isEnded: boolean
}

const TeamPromptDraftingCard = (props: Props) => {
  const {preferredName, picture, answeredCount, promptCount, hasStarted, isEnded} = props
  const title = isEnded
    ? 'No response'
    : hasStarted
      ? `Drafting · ${answeredCount} of ${promptCount} answered`
      : "Hasn't started yet"
  return (
    <div className='mx-auto flex w-full max-w-[640px] flex-col'>
      <div className='mb-3 flex items-center gap-2 px-2'>
        <Avatar picture={picture} className='h-12 w-12 shrink-0 opacity-55' />
        <h3 className='m-0 min-w-0 truncate font-semibold text-base'>{preferredName}</h3>
      </div>
      <div className='flex min-h-[92px] flex-col justify-center gap-1 rounded-card bg-surface-well p-4'>
        <div className='flex items-center gap-2 font-semibold text-sm'>
          {!isEnded && <Create className='h-4 w-4' />}
          {title}
        </div>
        {!isEnded && (
          <div className='text-fg-primary text-xs'>
            You'll see {preferredName}'s update when they share it
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamPromptDraftingCard
