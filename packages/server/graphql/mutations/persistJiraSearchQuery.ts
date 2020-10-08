import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import JiraSearchQuery from '../../database/types/JiraSearchQuery'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import {isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import JiraSearchQueryInput from '../types/JiraSearchQueryInput'
import PersistJiraSearchQueryPayload from '../types/PersistJiraSearchQueryPayload'

const persistJiraSearchQuery = {
  type: GraphQLNonNull(PersistJiraSearchQueryPayload),
  description: `Add or remove a task and its estimate phase from the meeting`,
  args: {
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the team witht the settings we add the query to'
    },
    input: {
      type: GraphQLNonNull(JiraSearchQueryInput),
      description: 'the jira search query to persist (or remove, if isRemove is true)'
    }
  },
  resolve: async (
    _source,
    {teamId, input},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const MAX_QUERIES = 5
    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not on team`}}
    }
    const settings = (await dataLoader
      .get('meetingSettingsByType')
      .load({meetingType: 'poker', teamId})) as MeetingSettingsPoker
    if (!settings) {
      return {error: {message: `Team settings not found`}}
    }

    // MUTATIVE
    settings.jiraSearchQueries = settings.jiraSearchQueries || []
    const {queryString, isJQL, projectKeyFilters, isRemove} = input
    projectKeyFilters.sort()
    const {id: settingsId, jiraSearchQueries} = settings
    const lookupKey = JSON.stringify({queryString, projectKeyFilters})
    const searchQueryStrings = jiraSearchQueries.map(({queryString, projectKeyFilters}) =>
      JSON.stringify({queryString, projectKeyFilters})
    )
    const existingIdx = searchQueryStrings.indexOf(lookupKey)
    if (existingIdx !== -1) {
      // the search query already exists
      // if remove, then delete it
      // if not, then update the lastUsedAt
      if (isRemove) {
        // MUTATIVE
        jiraSearchQueries.splice(existingIdx, 1)
      } else {
        const queryToUpdate = jiraSearchQueries[existingIdx]
        // MUTATIVE
        queryToUpdate.lastUsedAt = new Date()
        jiraSearchQueries.sort((a, b) => (a.lastUsedAt > b.lastUsedAt ? -1 : 1))
      }
    } else if (!isRemove) {
      const newQuery = new JiraSearchQuery({
        queryString,
        isJQL,
        projectKeyFilters
      })
      // MUTATIVE
      jiraSearchQueries.unshift(newQuery)
      jiraSearchQueries.slice(0, MAX_QUERIES)
    }

    await r
      .table('MeetingSettings')
      .get(settingsId)
      .update({
        jiraSearchQueries
      })
      .run()

    const data = {settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'PersistJiraSearchQuerySuccess', data, subOptions)
    return data
  }
}

export default persistJiraSearchQuery
