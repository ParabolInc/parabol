import useRouter from '~/hooks/useRouter'
import {useMemo} from 'react'

const useUserTaskFilters = (viewerId: string) => {
  const {location} = useRouter()
  return useMemo(() => parseUserTaskFilterQueryParams(viewerId, location), [viewerId, location])
}

const parseUserTaskFilterQueryParams = (viewerId: string, location) => {
  const parsed = new URLSearchParams(location.search)
  const teamIds = parsed.has('teamIds') ? (parsed.get('teamIds') as string).split(',') : null
  const userIdsArray = parsed.has('userIds') ? (parsed.get('userIds') as string).split(',') : null
  console.log('parseUserTaskFilterQueryParams -> userIdsArray', userIdsArray)
  // const userIds = userIdsArray //(teamIds ? null : [viewerId])
  console.log('parseUserTaskFilterQueryParams -> teamIds', teamIds)
  const userIds = userIdsArray || (teamIds ? null : [viewerId])
  console.log('parseUserTaskFilterQueryParams -> userIds', userIds)
  const showArchived = !!parsed.get('archived')
  return {userIds, teamIds, showArchived}
}

export {parseUserTaskFilterQueryParams, useUserTaskFilters}
