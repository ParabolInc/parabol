import React, {useMemo} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import {UserTaskViewFilterLabels} from '~/types/constEnums'
import constructTeamFilterQueryParamURL from '~/utils/constructTeamFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import TimelineEventTypeEnum from '../../server/graphql/types/TimelineEventTypeEnum'
import {timelineEventTypeMenuLabels} from '../utils/constants'
interface Props {
  menuProps: MenuProps
}

const TeamFilterMenu = (props: Props) => {
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
          label={UserTaskViewFilterLabels.ALL_EVENTS}
          onClick={() => history.push(constructTeamFilterQueryParamURL(teamIds, userIds))}
        />
      )}
      {eventTypeValues.map((eventType, index) => (
        <MenuItem
          key={`teamFilter${eventType}-${index}`}
          dataCy={`team-filter-${eventType}-${index}`}
          label={timelineEventTypeMenuLabels[eventType]}
          onClick={() =>
            history.push(constructTeamFilterQueryParamURL(teamIds, userIds, undefined, [eventType]))
          }
        />
      ))}
    </Menu>
  )
}

export default TeamFilterMenu
