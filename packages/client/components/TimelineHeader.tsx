import graphql from 'babel-plugin-relay/macro'
import {Suspense, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TimelineEventEnum} from '../__generated__/MyDashboardTimelineQuery.graphql'
import type {TimelineHeader_viewer$key} from '../__generated__/TimelineHeader_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {FilterLabels} from '../types/constEnums'
import {Button} from '../ui/Button/Button'
import {Menu} from '../ui/Menu/Menu'
import {Select} from '../ui/Select/Select'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {SelectValue} from '../ui/Select/SelectValue'
import {timelineEventTypeMenuLabels} from '../utils/constants'
import constructFilterQueryParamURL from '../utils/constructFilterQueryParamURL'
import lazyPreload from '../utils/lazyPreload'
import {useQueryParameterParser} from '../utils/useQueryParameterParser'
import Checkbox from './Checkbox'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'

const TeamFilterMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamFilterMenu' */
      './TeamFilterMenu'
    )
)

const TimelineEventTypeMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TimelineEventTypeMenu' */
      './TimelineEventTypeMenu'
    )
)

// radix selects can't hold an empty value, so the "no filter" option needs a sentinel
const ALL_EVENT_TYPES = '__allEventTypes'

interface Props {
  viewerRef: TimelineHeader_viewer$key | null
}

const TimelineHeader = (props: Props) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {viewerId} = atmosphere
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TimelineHeader_viewer on User {
        id
        ...TeamFilterMenu_viewer
        teams {
          id
          name
        }
      }
    `,
    viewerRef
  )

  const teams = viewer?.teams ?? []
  const {teamIds, userIds, eventTypes, showArchived} = useQueryParameterParser(viewerId)
  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )
  const teamFilterName = (teamFilter && teamFilter.name) || FilterLabels.ALL_TEAMS
  const eventTypeFilterName =
    eventTypes && eventTypes.length > 0
      ? timelineEventTypeMenuLabels[eventTypes[0]!]!
      : FilterLabels.ALL_EVENTS

  return (
    <DashSectionHeader>
      <DashSectionControls className='w-full flex-wrap justify-start overflow-visible'>
        <Menu
          trigger={
            <DashFilterToggle
              className='mt-4 sidebar-left:mt-0 mr-16 sidebar-left:mr-6 mb-4 sidebar-left:mb-0 ml-0 sidebar-left:ml-0'
              label='Team'
              onMouseEnter={TeamFilterMenu.preload}
              value={teamFilterName}
              iconText='group'
            />
          }
        >
          <Suspense fallback={null}>
            <TeamFilterMenu viewer={viewer} />
          </Suspense>
        </Menu>
        <Select
          value={eventTypes?.[0] ?? ALL_EVENT_TYPES}
          onValueChange={(eventType) =>
            navigate(
              constructFilterQueryParamURL(
                teamIds,
                userIds,
                undefined,
                eventType === ALL_EVENT_TYPES ? undefined : [eventType as TimelineEventEnum]
              )
            )
          }
        >
          <SelectTrigger asChild>
            <DashFilterToggle
              className='mt-4 sidebar-left:mt-0 mr-16 sidebar-left:mr-6 mb-4 sidebar-left:mb-0 ml-0 sidebar-left:ml-0'
              label='Event Type'
              onMouseEnter={TimelineEventTypeMenu.preload}
              value={<SelectValue>{eventTypeFilterName}</SelectValue>}
            />
          </SelectTrigger>
          <Suspense fallback={null}>
            <TimelineEventTypeMenu allEventTypesValue={ALL_EVENT_TYPES} />
          </Suspense>
        </Select>
        <Button
          size='default'
          className='my-1 sidebar-left:my-0 shrink-0 bg-transparent p-0 font-semibold text-[14px] text-fg-secondary leading-5 shadow-none hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
          onClick={() =>
            navigate(constructFilterQueryParamURL(teamIds, null, !showArchived, eventTypes))
          }
        >
          <Checkbox
            active={showArchived}
            className='mr-2 w-[24px] select-none text-center text-[24px]'
          />
          {'Archived'}
        </Button>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default TimelineHeader
