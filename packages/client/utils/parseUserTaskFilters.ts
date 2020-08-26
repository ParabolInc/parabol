import * as queryString from "query-string"
import {Location} from "history"

const parseUserTaskFilters = (viewerId: string, location?: Location) => {
  const locationToUse = location ? location : window.location
  const parsed = queryString.parse(locationToUse.search, {parseBooleans: true})
  const teamIds = parsed.teamIds ? [parsed.teamIds as string] : undefined
  const userIdsArray = parsed.userIds ? (parsed.userIds as string).split(',') : undefined
  const userIds = userIdsArray || (teamIds ? undefined : [viewerId])
  const showArchived = parsed.archived as boolean
  return {userIds, teamIds, showArchived}
}

export default parseUserTaskFilters
