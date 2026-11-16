import type {TaskClientIntegration} from '../integrations/platform/registry'
import TaskCardStatusIndicator from '../modules/taskCard/components/TaskCardStatusIndicator/TaskCardStatusIndicator'
import ReviewTasksExampleOwner, {type ExampleOwner} from './ReviewTasksExampleOwner'
import ReviewTasksExampleSend from './ReviewTasksExampleSend'

interface Props {
  isSent: boolean
  owner: ExampleOwner | undefined
  services: readonly TaskClientIntegration[]
  suggestedServices: readonly TaskClientIntegration[]
  teamId: string
  teamMembers: readonly ExampleOwner[]
  onOwner: (userId: string) => void
  onSent: () => void
}

const ReviewTasksExampleCard = (props: Props) => {
  const {isSent, owner, services, suggestedServices, teamId, teamMembers, onOwner, onSent} = props
  return (
    <div className='w-full rounded bg-surface-card pt-4 shadow-[var(--shadow-card)]'>
      <div className='pr-2 pb-1 pl-4 font-semibold text-fg-secondary text-xs leading-5'>
        <TaskCardStatusIndicator status='active' />
        Just now
      </div>
      <p className='min-h-[44px] px-4 pt-1 text-fg-primary text-sm leading-5'>
        Tasks capture what your team agrees to improve, so decisions made in this retro actually
        happen.
      </p>
      {isSent && (
        <div className='mx-4 mt-2 text-fg-secondary text-sm leading-5'>Example, not sent</div>
      )}
      <div className='flex items-center justify-between py-2 pr-2 pl-4'>
        <ReviewTasksExampleOwner owner={owner} teamMembers={teamMembers} onOwner={onOwner} />
        {!isSent && (
          <ReviewTasksExampleSend
            services={services}
            suggestedServices={suggestedServices}
            teamId={teamId}
            onSent={onSent}
          />
        )}
      </div>
    </div>
  )
}

export default ReviewTasksExampleCard
