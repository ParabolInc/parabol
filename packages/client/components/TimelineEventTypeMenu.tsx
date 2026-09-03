import {FilterLabels} from '../types/constEnums'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {timelineEventTypeMenuLabels} from '../utils/constants'
import DropdownMenuLabel from './DropdownMenuLabel'
import EventTypeFilterMenuItemLabel from './EventTypeFilterMenuItemLabel'

interface Props {
  allEventTypesValue: string
}

const eventTypes = [
  'retroComplete',
  'POKER_COMPLETE',
  'TEAM_PROMPT_COMPLETE',
  'actionComplete',
  'createdTeam',
  'joinedParabol'
] as const

const TimelineEventTypeMenu = (props: Props) => {
  const {allEventTypesValue} = props
  return (
    <SelectContent>
      <DropdownMenuLabel>{'Filter by event type:'}</DropdownMenuLabel>
      <SelectItem value={allEventTypesValue} textValue={FilterLabels.ALL_EVENTS}>
        <span className='flex items-center'>
          <EventTypeFilterMenuItemLabel />
        </span>
      </SelectItem>
      {eventTypes.map((eventType) => {
        return (
          <SelectItem
            key={eventType}
            value={eventType}
            textValue={timelineEventTypeMenuLabels[eventType]}
          >
            <span className='flex items-center'>
              <EventTypeFilterMenuItemLabel eventType={eventType} />
            </span>
          </SelectItem>
        )
      })}
    </SelectContent>
  )
}

export default TimelineEventTypeMenu
