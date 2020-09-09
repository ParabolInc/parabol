import useRouter from '~/hooks/useRouter'
import {useMemo} from 'react'

const useUserTaskFilters = (viewerId: string) => {
  const {location} = useRouter()
  return useMemo(() => {
    const parsed = new URLSearchParams(location.search)
    const teamIds = parsed.has('teamIds') ? (parsed.get('teamIds') as string).split(',') : undefined
    const userIdsArray = parsed.has('userIds') ? (parsed.get('userIds') as string).split(',') : undefined
    const userIds = userIdsArray || (teamIds ? undefined : [viewerId])
    const showArchived = !!parsed.get('archived')
    return {userIds, teamIds, showArchived}
  }, [viewerId, location])
}

export default useUserTaskFilters
