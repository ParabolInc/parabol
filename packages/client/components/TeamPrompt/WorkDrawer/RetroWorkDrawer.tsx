import graphql from 'babel-plugin-relay/macro'
import {Fragment, Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {RetroWorkDrawer_meeting$key} from '../../../__generated__/RetroWorkDrawer_meeting.graphql'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import {listClientIntegrationServices} from '../../../integrations/platform/registry'
import {cn} from '../../../ui/cn'
import dndNoise from '../../../utils/dndNoise'
import getNextSortOrder from '../../../utils/getNextSortOrder'
import {Loader} from '../../../utils/relay/renderLoader'
import ErrorBoundary from '../../ErrorBoundary'
import ParabolLogoSVG from '../../ParabolLogoSVG'
import ParabolTasksPanel from './ParabolTasksPanel'
import WorkDrawerConnect from './WorkDrawerConnect'
import WorkDrawerConsumeContext from './WorkDrawerConsumeContext'

const PARABOL_TAB_KEY = 'PARABOL'

interface Props {
  meetingRef: RetroWorkDrawer_meeting$key
}

const RetroWorkDrawer = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroWorkDrawer_meeting on RetrospectiveMeeting {
        id
        teamId
        reflectionGroups {
          promptId
          sortOrder
          reflections {
            plaintextContent
          }
        }
        phases {
          ... on ReflectPhase {
            phaseType
            reflectPrompts {
              id
              question
              groupColor
            }
          }
        }
        ...ParabolTasksPanel_meeting
        viewerMeetingMember {
          teamMember {
            services {
              service
              isAvailable
              isConnected
              ...useConnectIntegrationService_service
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId} = meeting
  const services = meeting.viewerMeetingMember?.teamMember?.services ?? []

  // Reflect phase stacks reflections descending by sortOrder, so the highest sortOrder is on top.
  const getNextReflectionSortOrder = (promptId: string | null) => {
    const promptGroups = meeting.reflectionGroups.filter((group) => group.promptId === promptId)
    return getNextSortOrder(promptGroups, dndNoise())
  }

  const reflectPrompts = meeting.phases.flatMap((phase) => phase.reflectPrompts ?? [])
  const getReflectPrompt = (promptId: string | null) => {
    const prompt = reflectPrompts.find(({id}) => id === promptId)
    return prompt ? {question: prompt.question, groupColor: prompt.groupColor} : null
  }

  const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim()
  const isReflectionAdded = (promptId: string | null, plaintext: string) => {
    const target = normalizeText(plaintext)
    if (!target) return false
    return meeting.reflectionGroups.some(
      (group) =>
        group.promptId === promptId &&
        group.reflections.some((r) => normalizeText(r.plaintextContent) === target)
    )
  }

  const serviceTabs = listClientIntegrationServices(services).flatMap(
    ({integrationService, definition}) => {
      const {workDrawer} = definition.capabilities
      if (!integrationService.isAvailable || !workDrawer) return []
      const {Panel} = workDrawer
      return [
        {
          service: definition.service,
          icon: <definition.Icon className={definition.iconClassName} />,
          label: definition.title,
          renderPanel: () =>
            integrationService.isConnected ? (
              <ErrorBoundary>
                <Suspense fallback={<Loader />}>
                  <Panel meetingId={meetingId} teamId={teamId} />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <WorkDrawerConnect
                teamId={teamId}
                definition={definition}
                serviceRef={integrationService}
              />
            )
        }
      ]
    }
  )
  const baseTabs = [
    {
      icon: <ParabolLogoSVG />,
      service: PARABOL_TAB_KEY,
      label: 'Parabol',
      renderPanel: () => <ParabolTasksPanel meetingRef={meeting} />
    },
    ...serviceTabs
  ]

  // Default to the first enabled non-Parabol integration, falling back to the Parabol section
  const defaultService =
    baseTabs.find((tab) => tab.service !== PARABOL_TAB_KEY)?.service ?? PARABOL_TAB_KEY
  const [activeService, setActiveService] = useSessionStorageState<string>(
    `Inspiration:tab:${meetingId}`,
    defaultService
  )
  const activeIdx = Math.max(
    0,
    baseTabs.findIndex((tab) => tab.service === activeService)
  )

  const activeTab = baseTabs[activeIdx]!

  return (
    <WorkDrawerConsumeContext.Provider
      value={{mode: 'retro', getNextReflectionSortOrder, getReflectPrompt, isReflectionAdded}}
    >
      <div className='flex min-h-0 flex-1 flex-col'>
        <div className='flex justify-center pt-3 pb-2'>
          <div className='flex gap-1'>
            {baseTabs.map((tab, idx) => (
              <button
                key={tab.label}
                title={tab.label}
                onClick={() => setActiveService(tab.service)}
                className={cn(
                  'flex h-10 w-10 select-none appearance-none items-center justify-center rounded-md transition-colors',
                  idx === activeIdx
                    ? // the logos are dark brand colors, so they go monochrome on the selected fill
                      'bg-surface-selected text-fg-selected [&_path]:fill-current'
                    : 'cursor-pointer text-fg-muted hover:bg-surface-hover'
                )}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        </div>
        <Fragment key={activeTab.service}>{activeTab.renderPanel()}</Fragment>
      </div>
    </WorkDrawerConsumeContext.Provider>
  )
}

export default RetroWorkDrawer
