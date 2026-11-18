import {useLocation} from '@tanstack/react-router'
import {useMemo} from 'react'
import type {TimelineEventEnum} from '../__generated__/TimelineFeedListPaginationQuery.graphql'

const useQueryParameterParser = (viewerId: string) => {
  const searchStr = useLocation({select: (location) => location.searchStr})
  return useMemo(() => parseQueryParams(viewerId, searchStr), [viewerId, searchStr])
}

const parseQueryParams = (viewerId: string, search: string) => {
  const parsed = new URLSearchParams(search)
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
