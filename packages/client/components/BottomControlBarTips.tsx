import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import type {BottomControlBarTips_meeting$key} from '~/__generated__/BottomControlBarTips_meeting.graphql'
import useTimeout from '~/hooks/useTimeout'
import type LocalAtmosphere from '~/modules/demo/LocalAtmosphere'
import lazyPreload, {type LazyPreloadedComponent} from '~/utils/lazyPreload'
import type {NewMeetingPhaseTypeEnum} from '../__generated__/BottomControlBarTips_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

const CheckInHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'CheckInHelpMenu' */ './MeetingHelp/CheckInHelpMenu')
)
const TeamHealthHelpMenu = lazyPreload(
  async () =>
    import(/* webpackChunkName: 'TeamHealthHelpMenu' */ './MeetingHelp/TeamHealthHelpMenu')
)

const ReflectHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'ReflectHelpMenu' */ './MeetingHelp/ReflectHelpMenu')
)
const DemoReflectHelpMenu = lazyPreload(
  async () =>
    import(/* webpackChunkName: 'DemoReflectHelpMenu' */ './MeetingHelp/DemoReflectHelpMenu')
)
const GroupHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'GroupHelpMenu' */ './MeetingHelp/GroupHelpMenu')
)
const DemoGroupHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'DemoGroupHelpMenu' */ './MeetingHelp/DemoGroupHelpMenu')
)
const VoteHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'VoteHelpMenu' */ './MeetingHelp/VoteHelpMenu')
)
const DemoVoteHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'DemoVoteHelpMenu' */ './MeetingHelp/DemoVoteHelpMenu')
)
const DiscussHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'DiscussHelpMenu' */ './MeetingHelp/DiscussHelpMenu')
)
const DemoDiscussHelpMenu = lazyPreload(
  async () =>
    import(/* webpackChunkName: 'DemoDiscussHelpMenu' */ './MeetingHelp/DemoDiscussHelpMenu')
)
const ActionMeetingAgendaItemsHelpMenu = lazyPreload(
  async () =>
    import(
      /* webpackChunkName: 'ActionMeetingAgendaItemsHelpMenu' */ './MeetingHelp/ActionMeetingAgendaItemsHelpMenu'
    )
)
const ActionMeetingFirstCallHelpMenu = lazyPreload(
  async () =>
    import(
      /* webpackChunkName: 'ActionMeetingFirstCallHelpMenu' */ './MeetingHelp/ActionMeetingFirstCallHelpMenu'
    )
)
const ActionMeetingLastCallHelpMenu = lazyPreload(
  async () =>
    import(
      /* webpackChunkName: 'ActionMeetingLastCallHelpMenu' */ './MeetingHelp/ActionMeetingLastCallHelpMenu'
    )
)
const UpdatesHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'UpdatesHelpMenu' */ './MeetingHelp/UpdatesHelpMenu')
)

const ScopeHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'ScopeHelpMenu' */ './MeetingHelp/ScopeHelpMenu')
)

const EstimateHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'EstimateHelpMenu' */ './MeetingHelp/EstimateHelpMenu')
)

const demoHelps: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  checkin: DemoReflectHelpMenu,
  reflect: DemoReflectHelpMenu,
  group: DemoGroupHelpMenu,
  vote: DemoVoteHelpMenu,
  discuss: DemoDiscussHelpMenu
}

const helps: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  checkin: CheckInHelpMenu,
  TEAM_HEALTH: TeamHealthHelpMenu,
  reflect: ReflectHelpMenu,
  group: GroupHelpMenu,
  vote: VoteHelpMenu,
  discuss: DiscussHelpMenu,
  updates: UpdatesHelpMenu,
  firstcall: ActionMeetingFirstCallHelpMenu,
  agendaitems: ActionMeetingAgendaItemsHelpMenu,
  lastcall: ActionMeetingLastCallHelpMenu,
  SCOPE: ScopeHelpMenu,
  ESTIMATE: EstimateHelpMenu
}

interface Props {
  cancelConfirm: (() => void) | undefined
  meeting: BottomControlBarTips_meeting$key
}

const BottomControlBarTips = (props: Props) => {
  const {cancelConfirm, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment BottomControlBarTips_meeting on NewMeeting {
        ...VoteHelpMenu_meeting
        ...ReflectHelpMenu_settings
        id
        meetingType
        localPhase {
          phaseType
        }
        localStage {
          ...TeamHealthHelpMenu_stage
        }
        phases {
          phaseType
        }
      }
    `,
    meetingRef
  )

  const {localPhase, localStage, meetingType} = meeting
  const {phaseType} = localPhase
  const [isOpen, setIsOpen] = useState(false)
  const atmosphere = useAtmosphere()
  const demoPauseOpen = useTimeout(1000)
  const menus = isDemoRoute() ? demoHelps : helps
  const HelpMenu = menus[phaseType]
  useEffect(() => {
    if (demoPauseOpen && isDemoRoute()) {
      const {clientGraphQLServer} = atmosphere as unknown as LocalAtmosphere
      if (clientGraphQLServer.db._started) {
        setIsOpen(true)
      } else {
        // wait for the startBot event to occur
        clientGraphQLServer.once('startDemo', () => {
          setIsOpen(true)
        })
      }
    }
  }, [demoPauseOpen])

  if (!HelpMenu) {
    return null
  }

  if (cancelConfirm) {
    return (
      <BottomNavControl dataCy={'tip-menu-toggle'} confirming onClick={cancelConfirm}>
        <BottomNavIconLabel icon='help_outline' iconColor='midGray' label={'Tips'} />
      </BottomNavControl>
    )
  }

  return (
    <Menu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <BottomNavControl dataCy={'tip-menu-toggle'}>
          <BottomNavIconLabel icon='help_outline' iconColor='midGray' label={'Tips'} />
        </BottomNavControl>
      }
    >
      <MenuContent side='top' align='start' className='max-h-80'>
        <Suspense fallback={null}>
          <HelpMenu
            meetingType={meetingType}
            stageRef={localStage}
            meetingRef={meeting}
            onClose={() => setIsOpen(false)}
          />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default BottomControlBarTips
