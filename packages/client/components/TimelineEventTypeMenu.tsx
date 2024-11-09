import {useMemo} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import constructFilterQueryParamURL from '~/utils/constructFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import TimelineEventTypeEnum from '../../server/graphql/types/TimelineEventTypeEnum'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import EventTypeFilterMenuItemLabel from './EventTypeFilterMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
}

const TimelineEventTypeMenu = (props: Props) => {
  const {history} = useRouter()
  const {menuProps} = props
  const atmosphere = useAtmosphere()
  const eventTypes = TimelineEventTypeEnum.getValues().map(({value}) => value)
  const {
    eventTypes: eventTypeFilters,
    teamIds,
    userIds
  } = useQueryParameterParser(atmosphere.viewerId)

  const {eventTypeValues, defaultActiveIdx} = useMemo(() => {
    const eventTypeValues = eventTypes
    return {
      eventTypeValues,
      defaultActiveIdx:
        eventTypeValues.findIndex((eventType) => eventTypeFilters?.includes(eventType)) + 2
    }
  }, [eventTypeFilters])

  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select the even type to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by event type:'}</DropdownMenuLabel>
      <MenuItem
        key={'eventTypeFilterNULL'}
        label={<EventTypeFilterMenuItemLabel />}
        onClick={() => history.push(constructFilterQueryParamURL(teamIds, userIds))}
      />
      {eventTypeValues.map((eventType, index) => {
        return (
          <MenuItem
            key={`eventTypeFilter${eventType}-${index}`}
            label={<EventTypeFilterMenuItemLabel eventType={eventType} />}
            onClick={() =>
              history.push(constructFilterQueryParamURL(teamIds, userIds, undefined, [eventType]))
            }
          />
        )
      })}
    </Menu>
  )
}

export default TimelineEventTypeMenu
