import * as queryString from "query-string"
import useRouter from '~/hooks/useRouter'
import {useMemo} from 'react'

const useUserTaskFilters = (viewerId: string) => {
  const {location} = useRouter()
  return useMemo(() => {
    const parsed = queryString.parse(location.search, {parseBooleans: true})
    const teamIds = parsed.teamIds ? [parsed.teamIds as string] : undefined
    const userIdsArray = parsed.userIds ? (parsed.userIds as string).split(',') : undefined
    const userIds = userIdsArray || (teamIds ? undefined : [viewerId])
    const showArchived = parsed.archived as boolean
    return {userIds, teamIds, showArchived}
  }, [viewerId, location])
}

export default useUserTaskFilters
