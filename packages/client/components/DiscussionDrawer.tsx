import {Close} from '@mui/icons-material'
import {type ReactNode, useState} from 'react'
import type {DiscussionDrawerTranscripts_meeting$key} from '../__generated__/DiscussionDrawerTranscripts_meeting.graphql'
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
  // Custom header content replacing the label — e.g. TeamPrompt's avatar + name row.
  // The close button is always appended after this by DiscussionDrawer.
  headerContent?: ReactNode
  // Content passed inside the thread above thread items (e.g. TeamPrompt's prompt + reactjis).
  threadHeader?: ReactNode
  // When provided a Your Work tab is inserted between Discussion and Transcription.
  workContent?: ReactNode
}

const DiscussionDrawer = ({
  discussionId,
  onToggle,
  allowedThreadables,
  meetingRef,
  headerContent,
  threadHeader,
  workContent
}: Props) => {
  const tabs = [
    {id: 'discussion', label: 'Discussion'},
    ...(workContent ? [{id: 'work', label: 'Your Work'}] : []),
    {id: 'transcription', label: 'Transcription'}
  ]
  const [activeIdx, setActiveIdx] = useState(0)
  const hasTabs = tabs.length > 1
  const activeTabId = tabs[activeIdx]?.id ?? 'discussion'

  const drawerStyle: React.CSSProperties = {
    paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0
  }

  return (
    <div
      className='flex h-screen w-[360px] select-none flex-col justify-start overflow-hidden bg-white'
      style={drawerStyle}
    >
      <div className='flex w-full items-center border-slate-300 border-b'>
        {hasTabs ? (
          <Tabs activeIdx={activeIdx} className='flex-1'>
            {tabs.map((tab, idx) => (
              <Tab
                key={tab.id}
                label={tab.label}
                onClick={() => setActiveIdx(idx)}
                className='flex-1 whitespace-nowrap text-xs'
              />
            ))}
          </Tabs>
        ) : (
          <div className='flex-1 px-3 py-2'>
            {headerContent ?? (
              <span className='font-semibold text-slate-700 text-xs uppercase tracking-wider'>
                {'Discussion'}
              </span>
            )}
          </div>
        )}
        <PlainButton onClick={onToggle} className='h-6 shrink-0 px-2'>
          <Close className='cursor-pointer text-slate-600 hover:opacity-50' />
        </PlainButton>
      </div>
      {activeTabId === 'work' ? (
        workContent
      ) : activeTabId === 'transcription' ? (
        <DiscussionDrawerTranscripts meetingRef={meetingRef} />
      ) : activeTabId === 'discussion' && discussionId ? (
        <DiscussionDrawerThread
          discussionId={discussionId}
          allowedThreadables={allowedThreadables}
          header={threadHeader}
        />
      ) : null}
    </div>
  )
}

export default DiscussionDrawer
