import {forwardRef} from 'react'
import {ExpandMore} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import TeamUpdatesAvatarStack from './TeamUpdatesAvatarStack'
import TeamUpdatesLayoutSwitch from './TeamUpdatesLayoutSwitch'
import type {TeamLayout} from './useTeamLayoutPreference'

interface Props {
  sharedMembers: readonly {id: string; preferredName: string; picture: string}[]
  draftingCount: number
  layout: TeamLayout
  onLayoutChange: (layout: TeamLayout) => void
  isPinned: boolean
  onSeeTeam: () => void
}

const TeamUpdatesHeader = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {sharedMembers, draftingCount, layout, onLayoutChange, isPinned, onSeeTeam} = props
  const sharedCount = sharedMembers.length
  return (
    <div
      ref={ref}
      className={cn(
        'sticky bottom-3 z-5 mx-auto w-full px-[5%] py-2',
        layout === 'byQuestion' ? 'max-w-[760px]' : 'max-w-[1240px]',
        isPinned &&
          'max-w-[760px] rounded-lg border border-hairline border-solid bg-surface-card px-3 shadow-[var(--shadow-card)]'
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full items-center gap-3',
          layout === 'feed' && !isPinned && 'max-w-[640px]'
        )}
      >
        <TeamUpdatesAvatarStack members={sharedMembers} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <h3 className='m-0 font-semibold text-base'>Team updates</h3>
          <div className='text-fg-muted text-xs'>
            {sharedCount} shared · {draftingCount} drafting
          </div>
        </div>
        {isPinned ? (
          <button
            type='button'
            onClick={onSeeTeam}
            className='flex items-center gap-1 bg-transparent font-semibold text-[13px] text-accent'
          >
            See what the team shared
            <ExpandMore className='h-5 w-5' />
          </button>
        ) : (
          <TeamUpdatesLayoutSwitch layout={layout} onChange={onLayoutChange} />
        )}
      </div>
    </div>
  )
})

export default TeamUpdatesHeader
