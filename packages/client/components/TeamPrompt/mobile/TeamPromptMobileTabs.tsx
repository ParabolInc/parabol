import {Check} from '~/ui/icons'
import {cn} from '../../../ui/cn'

export type TeamPromptMobileTab = 'mine' | 'team'

interface Props {
  activeTab: TeamPromptMobileTab
  onChange: (tab: TeamPromptMobileTab) => void
  hasViewerShared: boolean
  sharedCount: number
  memberCount: number
}

const tabClassName =
  'flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border-transparent border-b-[3px] bg-transparent font-semibold text-fg-muted text-sm aria-selected:border-surface-selected aria-selected:text-fg-primary'

const TeamPromptMobileTabs = (props: Props) => {
  const {activeTab, onChange, hasViewerShared, sharedCount, memberCount} = props
  return (
    <div role='tablist' className='flex shrink-0 border-hairline border-b'>
      <button
        type='button'
        role='tab'
        id='standup-tab-mine'
        aria-selected={activeTab === 'mine'}
        aria-controls='standup-panel-mine'
        onClick={() => onChange('mine')}
        className={tabClassName}
      >
        My update
        {hasViewerShared && <Check className='size-4.5 text-jade-600' aria-label='Shared' />}
      </button>
      <button
        type='button'
        role='tab'
        id='standup-tab-team'
        aria-selected={activeTab === 'team'}
        aria-controls='standup-panel-team'
        onClick={() => onChange('team')}
        className={cn(tabClassName)}
      >
        Team
        <span className='font-medium text-fg-muted text-xs'>
          {sharedCount} of {memberCount}
        </span>
      </button>
    </div>
  )
}

export default TeamPromptMobileTabs
