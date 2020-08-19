import * as queryString from "query-string"
import useRouter from '~/hooks/useRouter'
import {Location} from "history"

const parseUserTaskFilters = (location?: Location) => {
  const locationToUse = location ? location : useRouter().location
  const parsed = queryString.parse(locationToUse.search)
  const userIds = parsed.userId ? [parsed.userId as string] : undefined
  const teamIds = parsed.teamId ? [parsed.teamId as string] : undefined
  return {userIds, teamIds}
}

export default parseUserTaskFilters
