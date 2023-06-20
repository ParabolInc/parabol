import {Location} from 'history'
import {useMemo} from 'react'
import useRouter from '~/hooks/useRouter'
import {TimelineEventEnum} from '../__generated__/TimelineFeedListPaginationQuery.graphql'

const useQueryParameterParser = (viewerId: string) => {
  const {location} = useRouter()
  return useMemo(() => parseQueryParams(viewerId, location), [viewerId, location])
}

const parseQueryParams = (viewerId: string, location: Location | Window['location']) => {
  const parsed = new URLSearchParams(location.search)
  const teamIds = parsed.has('teamIds') ? (parsed.get('teamIds') as string).split(',') : null
  const userIdsArray = parsed.has('userIds') ? (parsed.get('userIds') as string).split(',') : null
  const userIds = userIdsArray || (teamIds ? null : [viewerId])
  const showArchived = !!parsed.get('archived')
  const eventTypes = parsed.has('eventTypes')
    ? ((parsed.get('eventTypes') as string).split(',') as TimelineEventEnum[])
    : null
  return {userIds, teamIds, showArchived, eventTypes}
}

export {parseQueryParams, useQueryParameterParser}
