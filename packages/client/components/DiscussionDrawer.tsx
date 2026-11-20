import type {ReactNode} from 'react'
import {Close} from '~/ui/icons'
import type {DiscussionDrawerTranscripts_meeting$key} from '../__generated__/DiscussionDrawerTranscripts_meeting.graphql'
import useLastNonNull from '../hooks/useLastNonNull'
import useSessionStorageState from '../hooks/useSessionStorageState'
import {GlobalBanner} from '../types/constEnums'
import DiscussionDrawerThread from './DiscussionDrawerThread'
import DiscussionDrawerTranscripts from './DiscussionDrawerTranscripts'
import type {DiscussionThreadables} from './DiscussionThreadList'
import PlainButton from './PlainButton/PlainButton'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

interface Props {
  discussionId?: string
  onToggle: () => void
  allowedThreadables: DiscussionThreadables[]
  meetingRef?: DiscussionDrawerTranscripts_meeting$key | null
  // When provided, the selected tab is persisted to sessionStorage scoped to this meeting.
  meetingId?: string
  // Content passed inside the thread above thread items (e.g. TeamPrompt's prompt + reactjis).
  threadHeader?: ReactNode
  // When provided a Your Work tab is inserted between Discussion and Transcription.
  workContent?: ReactNode
  // When provided a Settings tab follows Transcription.
  settingsContent?: ReactNode
  // When set, the Discussion tab is omitted entirely (e.g. retro reflect/group phases, which have
  // no discussion thread — only Inspiration and Transcription).
  hideDiscussion?: boolean
  // When provided, the selected tab is controlled by the parent instead of sessionStorage
  // (e.g. TeamPrompt's rightDrawerOpen). Pair with onChangeTab to keep the parent in sync.
  activeTab?: string | null
  onChangeTab?: (tabId: string) => void
  // false where the discussion changes as a side effect of navigating the meeting. See
  // DiscussionThreadInput
  autoFocus?: boolean
  showLastTopicLine?: boolean
}

const DiscussionDrawer = ({
  discussionId,
  onToggle,
  allowedThreadables,
  meetingRef,
  meetingId,
  threadHeader,
  workContent,
  settingsContent,
  activeTab,
  onChangeTab,
  hideDiscussion,
  autoFocus,
  showLastTopicLine
}: Props) => {
  const tabs = [
    ...(hideDiscussion ? [] : [{id: 'discussion', label: 'Discussion'}]),
    ...(workContent ? [{id: 'inspiration', label: 'Inspiration'}] : []),
    {id: 'transcription', label: 'Transcription'},
    ...(settingsContent ? [{id: 'settings', label: 'Settings'}] : [])
  ]
  const defaultTabId = hideDiscussion ? 'inspiration' : 'discussion'
  const [storedTabId, setStoredTabId] = useSessionStorageState<string>(
    meetingId ? `DiscussionDrawer:tab:${meetingId}` : null,
    defaultTabId
  )
  // When `activeTab` is provided the tab is controlled by the parent (e.g. TeamPrompt's
  // rightDrawerOpen); otherwise it falls back to the sessionStorage-backed state.
  const isControlled = activeTab !== undefined
  // The parent clears activeTab to close the drawer; keep the last tab while it slides out
  const lastOpenTab = useLastNonNull(activeTab)
  const requestedTabId = isControlled ? (lastOpenTab ?? defaultTabId) : storedTabId
  const setActiveTabId = (tabId: string) => {
    if (isControlled) onChangeTab?.(tabId)
    else setStoredTabId(tabId)
  }

  const activeIdx = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === requestedTabId)
  )
  const activeTabId = tabs[activeIdx]!.id

  const drawerStyle: React.CSSProperties = {
    paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0
  }

  return (
    <div
      // One surface for every tab, so the tab bar reads the same whichever panel is showing
      className='flex h-full w-[360px] flex-col justify-start overflow-hidden border-hairline border-l bg-surface-drawer'
      style={drawerStyle}
    >
      <div className='flex w-full select-none items-center border-hairline border-b'>
        <Tabs activeIdx={activeIdx} className='flex-1'>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
              onClick={() => setActiveTabId(tab.id)}
              className='flex-1 whitespace-nowrap text-xs'
            />
          ))}
        </Tabs>
        <PlainButton onClick={onToggle} className='h-6 shrink-0 px-2'>
          <Close className='cursor-pointer text-fg-secondary hover:opacity-50' />
        </PlainButton>
      </div>
      {activeTabId === 'inspiration' ? (
        workContent
      ) : activeTabId === 'settings' ? (
        settingsContent
      ) : activeTabId === 'transcription' ? (
        <DiscussionDrawerTranscripts meetingRef={meetingRef} />
      ) : activeTabId === 'discussion' && discussionId ? (
        <DiscussionDrawerThread
          discussionId={discussionId}
          allowedThreadables={allowedThreadables}
          header={threadHeader}
          autoFocus={autoFocus}
          showLastTopicLine={showLastTopicLine}
        />
      ) : null}
    </div>
  )
}

export default DiscussionDrawer
