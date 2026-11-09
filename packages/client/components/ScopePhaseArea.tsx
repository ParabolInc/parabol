import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {ScopePhaseArea_meeting$key} from '~/__generated__/ScopePhaseArea_meeting.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {
  isTaskClientIntegration,
  listClientIntegrationServices
} from '../integrations/platform/registry'
import IntegrationScopingPanel from './IntegrationScopingPanel'
import ParabolLogoSVG from './ParabolLogoSVG'
import ScopePhaseAreaConnect from './ScopePhaseAreaConnect'
import ScopePhaseAreaParabolScoping from './ScopePhaseAreaParabolScoping'
import type ScopePhaseTab from './ScopePhaseTab'
import ScopePhaseTabBar from './ScopePhaseTabBar'
import SwipeablePanel from './SwipeablePanel'
import useScopePhaseTabLayout from './useScopePhaseTabLayout'

const PARABOL_TAB_KEY = 'parabol'
const FAVORITE_SERVICE_STORAGE_KEY = 'favoriteService'

interface Props {
  meeting: ScopePhaseArea_meeting$key
}

const ScopePhaseArea = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseArea_meeting on PokerMeeting {
        ...ScopePhaseAreaParabolScoping_meeting
        ...IntegrationScopingPanel_meeting
        teamId
        viewerMeetingMember {
          teamMember {
            services {
              service
              isAvailable
              isConnected
              recentOrgTaskCount
              ...ScopePhaseAreaConnect_service
            }
          }
        }
      }
    `,
    meetingRef
  )
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {teamId, viewerMeetingMember} = meeting
  const services = viewerMeetingMember?.teamMember.services ?? []
  const [savedActiveKey, setSavedActiveKey] = useState(() =>
    window.localStorage.getItem(FAVORITE_SERVICE_STORAGE_KEY)
  )
  const [heldPickKey, setHeldPickKey] = useState(savedActiveKey)
  const gotoParabol = () => setSavedActiveKey(PARABOL_TAB_KEY)

  const integrations: ScopePhaseTab[] = listClientIntegrationServices(services).flatMap(
    ({integrationService, definition}) => {
      const {service, isAvailable, isConnected, recentOrgTaskCount} = integrationService
      const {scoping} = definition.capabilities
      if (!isTaskClientIntegration(service) || !scoping) return []
      if (!isAvailable && !definition.contactUs) return []
      const contactStatus = isAvailable ? null : ('contactUs' as const)
      return [
        {
          key: service,
          title: definition.title,
          isConnected,
          orgTaskCount: recentOrgTaskCount,
          icon: <definition.Icon className={definition.iconClassName} />,
          keywords: definition.searchKeywords ?? [],
          menuStatus: isConnected ? ('connected' as const) : contactStatus,
          renderPanel: () =>
            isConnected ? (
              <IntegrationScopingPanel service={service} meetingRef={meeting} />
            ) : (
              <ScopePhaseAreaConnect
                teamId={teamId}
                definition={definition}
                serviceRef={integrationService}
                gotoParabol={gotoParabol}
              />
            )
        }
      ]
    }
  )
  const parabol: ScopePhaseTab = {
    key: PARABOL_TAB_KEY,
    title: 'Parabol',
    isConnected: true,
    orgTaskCount: 0,
    icon: <ParabolLogoSVG />,
    keywords: [],
    menuStatus: null,
    renderPanel: () => <ScopePhaseAreaParabolScoping isActive meetingRef={meeting} />
  }
  const panelTabs = [...integrations, parabol]
  const {barRef, measureRef, layout} = useScopePhaseTabLayout({
    integrations,
    parabol,
    heldPickKey,
    savedActiveKey
  })
  const activeIdx = panelTabs.findIndex(({key}) => key === layout?.activeKey)

  const selectTab = (key: string) => {
    setSavedActiveKey(key)
    window.localStorage.setItem(FAVORITE_SERVICE_STORAGE_KEY, key)
  }
  const pickFromMenu = (key: string) => {
    setHeldPickKey(key)
    selectTab(key)
  }

  return (
    <div
      className={`flex flex-col rounded-lg bg-surface-card ${isDesktop ? '' : 'mx-auto'} ${isDesktop ? 'w-4/5' : 'w-[calc(100%-16px)]'} h-[70%] max-w-[1040px] shadow-[var(--shadow-card)]`}
    >
      <ScopePhaseTabBar
        allTabs={panelTabs}
        barRef={barRef}
        layout={layout}
        measureRef={measureRef}
        onPick={pickFromMenu}
        onSelect={selectTab}
      />
      <SwipeablePanel
        disabled
        index={Math.max(activeIdx, 0)}
        onChangeIndex={(idx) => selectTab(panelTabs[idx]?.key ?? PARABOL_TAB_KEY)}
        style={{width: '100%', flex: 1, minHeight: 0}}
      >
        {panelTabs.map((tab, idx) => (
          <div className='relative flex h-full flex-col overflow-hidden' key={tab.key}>
            {idx === activeIdx ? tab.renderPanel() : null}
          </div>
        ))}
      </SwipeablePanel>
    </div>
  )
}

export default ScopePhaseArea
