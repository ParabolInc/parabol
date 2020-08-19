import * as queryString from "query-string"
import useRouter from '~/hooks/useRouter'
import {Location} from "history"

const parseUserTaskFilters = (location?: Location) => {
  const locationToUse = location ? location : useRouter().location
  const parsed = queryString.parse(locationToUse.search, {parseBooleans: true})
  const userIds = parsed.userId ? [parsed.userId as string] : undefined
  const teamIds = parsed.teamId ? [parsed.teamId as string] : undefined
  const showArchived = parsed.archived as boolean
  return {userIds, teamIds, showArchived}
}

export default parseUserTaskFilters
