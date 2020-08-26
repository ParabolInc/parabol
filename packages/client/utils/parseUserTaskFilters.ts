import * as queryString from "query-string"
import {Location} from "history"
import useAtmosphere from '~/hooks/useAtmosphere'

const parseUserTaskFilters = (location?: Location) => {
  const locationToUse = location ? location : window.location
  const atmosphere = useAtmosphere()
  const viewerId = atmosphere.viewerId
  const parsed = queryString.parse(locationToUse.search, {parseBooleans: true})
  const teamIds = parsed.teamIds ? [parsed.teamIds as string] : undefined
  const userIdsArray = parsed.userIds ? (parsed.userIds as string).split(',') : undefined
  const userIds = userIdsArray || (teamIds ? undefined : [viewerId])
  const showArchived = parsed.archived as boolean
  return {userIds, teamIds, showArchived}
}

export default parseUserTaskFilters
