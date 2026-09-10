import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import type {ScopePhaseArea_meeting$key} from '~/__generated__/ScopePhaseArea_meeting.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint, LoaderSize} from '~/types/constEnums'
import {
  compareClientIntegrationPopularity,
  getClientIntegration,
  isRegisteredClientIntegration
} from '../integrations/platform/registry'
import ErrorBoundary from './ErrorBoundary'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import ParabolLogoSVG from './ParabolLogoSVG'
import ScopePhaseAreaConnect from './ScopePhaseAreaConnect'
import ScopePhaseAreaParabolScoping from './ScopePhaseAreaParabolScoping'
import SwipeablePanel from './SwipeablePanel'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

const PARABOL_TAB_KEY = 'parabol'
const DEFAULT_TAB_KEY = 'jira'
const FAVORITE_SERVICE_STORAGE_KEY = 'favoriteService'

interface Props {
  meeting: ScopePhaseArea_meeting$key
}

const ScopePhaseArea = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseArea_meeting on PokerMeeting {
        ...ScopePhaseAreaAzureDevOpsScoping_meeting
        ...ScopePhaseAreaGitHubScoping_meeting
        ...ScopePhaseAreaGitLabScoping_meeting
        ...ScopePhaseAreaJiraScoping_meeting
        ...ScopePhaseAreaJiraServerScoping_meeting
        ...ScopePhaseAreaLinearScoping_meeting
        ...ScopePhaseAreaParabolScoping_meeting
        teamId
        viewerMeetingMember {
          teamMember {
            services {
              service
              isAvailable
              isConnected
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
  const [activeKey, setActiveKey] = useState(
    () => window.localStorage.getItem(FAVORITE_SERVICE_STORAGE_KEY) ?? DEFAULT_TAB_KEY
  )
  const gotoParabol = () => setActiveKey(PARABOL_TAB_KEY)

  const serviceTabs = services.flatMap((integrationService) => {
    const {service, isAvailable, isConnected} = integrationService
    if (!isRegisteredClientIntegration(service)) return []
    const definition = getClientIntegration(service)
    const {scoping} = definition.capabilities
    if (!scoping) return []
    if (!isAvailable && !scoping.advertiseWhenUnavailable) return []
    return [
      {
        key: service,
        service,
        icon: <definition.Icon className={definition.iconClassName} />,
        label: definition.title,
        renderPanel: () =>
          isConnected ? (
            <ErrorBoundary>
              <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
                <scoping.Panel meetingRef={meeting} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <ScopePhaseAreaConnect
              teamId={teamId}
              serviceRef={integrationService}
              gotoParabol={gotoParabol}
            />
          )
      }
    ]
  })
  const tabs = [
    ...serviceTabs.sort((a, b) => compareClientIntegrationPopularity(a.service, b.service)),
    {
      key: PARABOL_TAB_KEY,
      icon: <ParabolLogoSVG />,
      label: 'Parabol',
      renderPanel: () => <ScopePhaseAreaParabolScoping isActive meetingRef={meeting} />
    }
  ]

  const findTabIdx = (key: string) => tabs.findIndex((tab) => tab.key === key)
  const activeTabIdx = findTabIdx(activeKey)
  const activeIdx = activeTabIdx === -1 ? Math.max(0, findTabIdx(DEFAULT_TAB_KEY)) : activeTabIdx

  const selectIdx = (idx: number) => {
    const key = tabs[idx]?.key
    if (!key) return
    setActiveKey(key)
    window.localStorage.setItem(FAVORITE_SERVICE_STORAGE_KEY, key)
  }

  return (
    <div
      className={`flex flex-col rounded-lg bg-surface-card ${isDesktop ? '' : 'mx-auto'} ${isDesktop ? 'w-4/5' : 'w-[calc(100%-16px)]'} h-[70%] max-w-[1040px] shadow-[var(--shadow-card)]`}
    >
      <div className='max-w-full'>
        <div className='scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded overflow-x-auto border-hairline border-b border-solid'>
          <Tabs activeIdx={activeIdx} className='max-w-sm'>
            {tabs.map((tab, idx) => (
              <Tab
                key={tab.key}
                label={
                  <div className='flex min-w-20 items-center justify-center whitespace-nowrap'>
                    <div className='mx-1 h-6 w-6'>{tab.icon}</div>
                    {tab.label}
                  </div>
                }
                onClick={() => selectIdx(idx)}
              />
            ))}
          </Tabs>
        </div>
      </div>
      <SwipeablePanel
        disabled
        index={activeIdx}
        onChangeIndex={selectIdx}
        style={{width: '100%', flex: 1, minHeight: 0}}
      >
        {tabs.map((tab, idx) => (
          <div className='relative flex h-full flex-col overflow-hidden' key={tab.key}>
            {idx === activeIdx ? tab.renderPanel() : null}
          </div>
        ))}
      </SwipeablePanel>
    </div>
  )
}

export default ScopePhaseArea
