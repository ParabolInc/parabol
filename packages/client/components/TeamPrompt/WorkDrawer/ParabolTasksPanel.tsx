import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ParabolTasksPanel_meeting$key} from '../../../__generated__/ParabolTasksPanel_meeting.graphql'
import type {TaskStatusEnum} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import {TaskStatus} from '../../../types/constEnums'
import {Button} from '../../../ui/Button/Button'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {meetingColumnArray} from '../../../utils/constants'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import {taskStatusDotColors, taskStatusLabels} from '../../../utils/taskStatus'
import InspirationItemsPanel from './InspirationItemsPanel'
import ParabolStandupsResultsRoot from './ParabolStandupsResultsRoot'
import ParabolTasksResultsRoot from './ParabolTasksResultsRoot'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const SUB_TABS = [
  {key: 'tasks', label: 'Tasks'},
  {key: 'standups', label: 'Standups'}
] as const
type SubTab = (typeof SUB_TABS)[number]['key']

const PILL = 'shrink-0 text-fg-primary'
// the panel shares the drawer surface, so the resting pill is outlined rather than filled
const PILL_ACTIVE =
  'bg-surface-selected font-semibold text-fg-selected hover:bg-surface-selected focus:text-fg-selected'
const PILL_INACTIVE = 'border border-hairline-strong bg-transparent hover:bg-surface-hover'

interface Props {
  meetingRef: ParabolTasksPanel_meeting$key
}

const ParabolTasksPanel = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment ParabolTasksPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        id
        teamId
        parabolInspirationItems: inspirationItems(service: PARABOL) {
          id
          title
          content
          promptId
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const {dateRange, setDateRange} = useInspirationDrawer('PARABOL', meeting)
  const [subTab, setSubTab] = useSessionStorageState<SubTab>(
    `Inspiration:parabol:subTab:${meeting.id}`,
    'tasks'
  )
  const [selectedStatuses, setSelectedStatuses] = useSessionStorageState<TaskStatusEnum[]>(
    `Inspiration:parabol:taskStatuses:${meeting.id}`,
    [TaskStatus.DONE]
  )

  const toggleStatus = (status: TaskStatusEnum) => {
    trackTabNavigated(taskStatusLabels[status])
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  // The client serializes the date window as JSON; the server parses it to gather work items.
  const searchQuery = dateRange
    ? JSON.stringify({startAt: dateRange.startAt, endAt: dateRange.endAt})
    : ''

  const trackTabNavigated = (label: string) => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Tag Navigated', {
      service: 'PARABOL',
      buttonLabel: label
    })
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {/* Row 1: content type */}
      <div className='flex gap-2 px-4 pt-3 pb-1'>
        {SUB_TABS.map((tab) => (
          <Button
            key={tab.key}
            size='md'
            aria-pressed={tab.key === subTab}
            className={cn(PILL, tab.key === subTab ? PILL_ACTIVE : PILL_INACTIVE)}
            onClick={() => {
              trackTabNavigated(tab.label)
              setSubTab(tab.key)
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {/* Row 2: task status (Tasks only) */}
      {subTab === 'tasks' && (
        <div className='flex gap-x-3 px-4 py-2'>
          {meetingColumnArray.map((status) => (
            <label
              key={status}
              className='flex min-w-0 cursor-pointer items-center text-fg-primary text-sm'
            >
              <Checkbox
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              />
              <span
                className={cn('ml-1 size-2 shrink-0 rounded-full', taskStatusDotColors[status])}
              />
              <span className='ml-0.5 truncate'>{taskStatusLabels[status]}</span>
            </label>
          ))}
        </div>
      )}
      {/* Row 3: date range */}
      <div className='flex px-2 py-1'>
        <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>
      {/* Row 4: draft button + suggestions, then results (scrollable) */}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <InspirationItemsPanel
          meetingId={meeting.id}
          service='PARABOL'
          searchQuery={searchQuery}
          initialItems={meeting.parabolInspirationItems}
        />
        {subTab === 'tasks' ? (
          <ParabolTasksResultsRoot selectedStatuses={selectedStatuses} dateRange={dateRange} />
        ) : (
          <ParabolStandupsResultsRoot teamId={meeting.teamId} dateRange={dateRange} />
        )}
      </div>
    </div>
  )
}

export default ParabolTasksPanel
