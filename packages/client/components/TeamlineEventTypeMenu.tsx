import React, {useMemo} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import constructFilterQueryParamURL from '~/utils/constructFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import TimelineEventTypeEnum from '../../server/graphql/types/TimelineEventTypeEnum'
import EventTypeFilterMenuItemLabel from './EventTypeFilterMenuItemLabel'

interface Props {
  menuProps: MenuProps
}

const TeamlineEventTypeMenu = (props: Props) => {
  const {history} = useRouter()
  const {menuProps} = props
  const atmosphere = useAtmosphere()
  const eventTypes = TimelineEventTypeEnum.getValues().map(({value}) => value)
  const {
    eventTypes: eventTypeFilters,
    teamIds,
    userIds
  } = useQueryParameterParser(atmosphere.viewerId)

  const showAllEvents = !!eventTypeFilters
  const {eventTypeValues, defaultActiveIdx} = useMemo(() => {
    const eventTypeValues = eventTypes
    return {
      eventTypeValues,
      defaultActiveIdx:
        eventTypeValues.findIndex((eventType) => eventTypeFilters?.includes(eventType)) +
        (showAllEvents ? 2 : 1)
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
      {showAllEvents && (
        <MenuItem
          key={'eventTypeFilterNULL'}
          label={<EventTypeFilterMenuItemLabel />}
          onClick={() => history.push(constructFilterQueryParamURL(teamIds, userIds))}
        />
      )}
      {eventTypeValues.map((eventType, index) => {
        return (
          <MenuItem
            key={`teamFilter${eventType}-${index}`}
            dataCy={`team-filter-${eventType}-${index}`}
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

export default TeamlineEventTypeMenu
