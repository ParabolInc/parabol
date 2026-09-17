import {forwardRef} from 'react'
import {ExpandMore} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import TeamUpdatesAvatarStack from './TeamUpdatesAvatarStack'
import TeamUpdatesLayoutSwitch from './TeamUpdatesLayoutSwitch'
import {
  TEAM_UPDATES_BAND,
  TEAM_UPDATES_COLUMN,
  TEAM_UPDATES_GRID_HEADER_WIDTH,
  TEAM_UPDATES_QUESTION_BAND
} from './teamUpdatesLayout'
import type {TeamLayout} from './useTeamLayoutPreference'

interface Props {
  sharedMembers: readonly {id: string; preferredName: string; picture: string}[]
  draftingCount: number
  layout: TeamLayout
  onLayoutChange: (layout: TeamLayout) => void
  canPin: boolean
  isPinned: boolean
  onSeeTeam: () => void
}

const TeamUpdatesHeader = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {sharedMembers, draftingCount, layout, onLayoutChange, canPin, isPinned, onSeeTeam} = props
  const sharedCount = sharedMembers.length
  return (
    <div
      ref={ref}
      className={cn(
        'z-5 py-2',
        layout === 'byQuestion' ? TEAM_UPDATES_QUESTION_BAND : TEAM_UPDATES_BAND,
        canPin && 'sticky bottom-3',
        isPinned &&
          'max-w-[760px] rounded-lg border border-hairline border-solid bg-surface-card px-3 shadow-[var(--shadow-card)]'
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full items-center gap-3',
          !isPinned && layout !== 'byQuestion' && TEAM_UPDATES_COLUMN,
          !isPinned && layout === 'grid' && TEAM_UPDATES_GRID_HEADER_WIDTH
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
