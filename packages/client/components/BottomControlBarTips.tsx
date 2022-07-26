import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useTimeout from '~/hooks/useTimeout'
import {TransitionStatus} from '~/hooks/useTransition'
import LocalAtmosphere from '~/modules/demo/LocalAtmosphere'
import lazyPreload, {LazyExoticPreload} from '~/utils/lazyPreload'
import {BottomControlBarTips_meeting$key} from '~/__generated__/BottomControlBarTips_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import isDemoRoute from '../utils/isDemoRoute'
import {NewMeetingPhaseTypeEnum} from '../__generated__/BottomControlBarTips_meeting.graphql'
import BottomNavControl from './BottomNavControl'
import BottomNavHelpButton from './BottomNavHelpButton'
import Menu from './Menu'

const TallMenu = styled(Menu)({
  maxHeight: 320
})

const CheckInHelpMenu = lazyPreload(
  async () => import(/* webpackChunkName: 'CheckInHelpMenu' */ './MeetingHelp/CheckInHelpMenu')
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

const demoHelps = {
  checkin: DemoReflectHelpMenu,
  reflect: DemoReflectHelpMenu,
  group: DemoGroupHelpMenu,
  vote: DemoVoteHelpMenu,
  discuss: DemoDiscussHelpMenu
} as Record<NewMeetingPhaseTypeEnum, LazyExoticPreload<any>>

const helps = {
  checkin: CheckInHelpMenu,
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
} as Record<NewMeetingPhaseTypeEnum, LazyExoticPreload<any>>

interface Props {
  cancelConfirm: (() => void) | undefined
  meeting: BottomControlBarTips_meeting$key
  status: TransitionStatus
  onTransitionEnd: () => void
}
const BottomControlBarTips = (props: Props) => {
  const {cancelConfirm, meeting: meetingRef, status, onTransitionEnd} = props
  const meeting = useFragment(
    graphql`
      fragment BottomControlBarTips_meeting on NewMeeting {
        ... on RetrospectiveMeeting {
          reflectionGroups {
            id
          }
          localPhase {
            ... on ReflectPhase {
              reflectPrompts {
                id
                editorIds
              }
            }
          }
        }
        id
        meetingType
        localPhase {
          phaseType
        }
        phases {
          phaseType
        }
      }
    `,
    meetingRef
  )

  const {localPhase, meetingType} = meeting
  const {phaseType} = localPhase
  const {menuProps, menuPortal, originRef, togglePortal, openPortal} = useMenu(
    MenuPosition.LOWER_LEFT
  )
  const atmosphere = useAtmosphere()
  const demoPauseOpen = useTimeout(1000)
  const menus = isDemoRoute() ? demoHelps : helps
  // different condition for each phase
  // 1. reflect
  const reflectPrompts = localPhase!.reflectPrompts
  const hasNoEditing = reflectPrompts?.every((prompts) => prompts.editorIds?.length === 0)
  console.log('========no editorIds========', meeting, hasNoEditing)
  const MenuContent = menus[phaseType]
  useEffect(() => {
    if (demoPauseOpen && isDemoRoute()) {
      const {clientGraphQLServer} = atmosphere as unknown as LocalAtmosphere
      const {isNew} = clientGraphQLServer
      if (!isNew) {
        openPortal()
      } else {
        // wait for the startBot event to occur
        clientGraphQLServer.once('startDemo', () => {
          clientGraphQLServer.isNew = false
          openPortal()
        })
      }
    }
  }, [demoPauseOpen, openPortal])
  return (
    <BottomNavControl
      dataCy={`tip-menu-toggle`}
      confirming={!!cancelConfirm}
      onClick={cancelConfirm || togglePortal}
      ref={originRef}
      status={status}
      onTransitionEnd={onTransitionEnd}
    >
      <BottomNavHelpButton icon='help_outline' iconColor='midGray' label={'Tips'} />
      {menuPortal(
        <TallMenu ariaLabel='Meeting tips' {...menuProps}>
          <MenuContent meetingType={meetingType} />
        </TallMenu>
      )}
    </BottomNavControl>
  )
}

export default BottomControlBarTips
