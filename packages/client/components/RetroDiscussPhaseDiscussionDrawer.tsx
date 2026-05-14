import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {RetroDiscussPhaseDiscussionDrawer_meeting$key} from '~/__generated__/RetroDiscussPhaseDiscussionDrawer_meeting.graphql'
import {desktopSidebarShadow} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {
  BezierCurve,
  Breakpoint,
  DiscussionThreadEnum,
  GlobalBanner,
  ZIndex
} from '../types/constEnums'
import type {DiscussionThreadables} from './DiscussionThreadList'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import DiscussionThreadListEmptyTranscriptState from './DiscussionThreadListEmptyTranscriptState'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import PlainButton from './PlainButton/PlainButton'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  top: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none',
  width: isOpen || !isDesktop ? DiscussionThreadEnum.WIDTH : 0,
  zIndex: ZIndex.SIDEBAR,
  [`@media screen and (max-width: ${Breakpoint.POKER_DISCUSSION_FULLSCREEN_DRAWER}px)`]: {
    width: '100vw',
    position: 'fixed',
    right: isOpen ? `-${DiscussionThreadEnum.WIDTH}px` : '-100vw'
  }
}))

const ThreadColumn = styled('div')({
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  maxWidth: 700,
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const Header = styled('div')({
  alignItems: 'center',
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  width: '100%'
})

const CloseButton = styled(PlainButton)({
  height: 24,
  padding: '0 8px',
  flexShrink: 0
})

const tabs = [
  {id: 'discussion', label: 'Discussion'},
  {id: 'transcription', label: 'Transcription'}
] as const

interface Props {
  isDesktop: boolean
  isOpen: boolean
  meeting: RetroDiscussPhaseDiscussionDrawer_meeting$key
  onToggle: () => void
}

const RetroDiscussPhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isOpen, meeting: meetingRef, onToggle} = props
  const [activeIdx, setActiveIdx] = useState(0)
  const meeting = useFragment(
    graphql`
      fragment RetroDiscussPhaseDiscussionDrawer_meeting on RetrospectiveMeeting {
        ...DiscussionThreadListEmptyTranscriptState_meeting
        endedAt
        localStage {
          ...RetroDiscussPhaseDiscussionDrawerRetroDiscussStage @relay(mask: false)
        }
        phases {
          stages {
            ...RetroDiscussPhaseDiscussionDrawerRetroDiscussStage @relay(mask: false)
          }
        }
      }
    `,
    meetingRef
  )
  const {endedAt, localStage} = meeting
  const {discussionId} = localStage
  const allowedThreadables: DiscussionThreadables[] = endedAt ? [] : ['comment', 'task', 'poll']
  const isReadOnly = allowedThreadables.length === 0

  return (
    <Drawer isDesktop={isDesktop} isOpen={isOpen}>
      <Header>
        <Tabs activeIdx={activeIdx} className='flex-1'>
          {tabs.map((tab, idx) => (
            <Tab
              key={tab.id}
              label={tab.label}
              onClick={() => setActiveIdx(idx)}
              className='flex-1 text-xs'
            />
          ))}
        </Tabs>
        <CloseButton onClick={onToggle}>
          <CloseIcon />
        </CloseButton>
      </Header>
      <ThreadColumn>
        {activeIdx === 0 ? (
          <DiscussionThreadRoot
            allowedThreadables={allowedThreadables}
            discussionId={discussionId!}
            width='100%'
            emptyState={
              <DiscussionThreadListEmptyState allowTasks={true} isReadOnly={isReadOnly} />
            }
          />
        ) : (
          <DiscussionThreadListEmptyTranscriptState
            allowTasks={true}
            isReadOnly={isReadOnly}
            meetingRef={meeting}
          />
        )}
      </ThreadColumn>
    </Drawer>
  )
}

graphql`
  fragment RetroDiscussPhaseDiscussionDrawerRetroDiscussStage on NewMeetingStage {
    ... on RetroDiscussStage {
      discussionId
    }
  }
`

export default RetroDiscussPhaseDiscussionDrawer
