import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import getRethink from 'server/database/rethinkDriver'
import {GQLContext} from 'server/graphql/graphql'
import SuggestedIntegration from 'server/graphql/types/SuggestedIntegration'
import {getUserId} from 'server/utils/authorization'
import {ISuggestedIntegrationsOnUserArguments} from 'universal/types/graphql'
import {GITHUB} from 'universal/utils/constants'

const idFieldLookup = {
  github: 'nameWithOwner',
  jira: 'projectName'
}

const createSuggestedIntegrations = (integrations: any[]) => {
  return integrations.map((integration) => {
    return {
      id: integration[idFieldLookup[integration.service]],
      service: integration.service,
      nameWithOwner: integration.nameWithOwner,
      projectName: integration.projectName
    }
  })
}

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedIntegration))),
  args: {
    teamId: {
      type: GraphQLID,
      description: 'a teamId to use as a filter to provide more accurate suggestions'
    }
  },
  resolve: async (
    _source: any,
    {teamId}: ISuggestedIntegrationsOnUserArguments,
    {authToken, dataLoader}: GQLContext
  ) => {
    const r = getRethink()
    const viewerId = getUserId(authToken)
    if (teamId) {
      const teamIntegrationsByUserId = await r
        .table('Task')
        .getAll(teamId, {index: 'teamId'})
        .filter((row) =>
          row('integration')
            .ne(null)
            .default(false)
        )
        .group([
          r.row('integration')('service'),
          r.row('userId').default(null),
          r
            .row('integration')('nameWithOwner')
            .default(null),
          r
            .row('integration')('projectName')
            .default(null),
          r.row('userId')
        ])
        .max('createdAt')('createdAt')
        .ungroup()
        .orderBy(r.desc('reduction'))
        .map((row) => ({
          service: row('group')(0),
          userId: row('group')(1),
          nameWithOwner: row('group')(2),
          projectName: row('group')(3),
          lastUsedAt: row('reduction')
        }))
        .merge((row) => ({
          id: r.or(
            // create a unique ID across all provider interfaces
            row('projectName').default(false),
            row('nameWithOwner').default(false)
          )
        }))
      if (!teamIntegrationsByUserId.length) return []
      // at least 1 person has 1 integration on the team

      const userIntegrationsForTeam = teamIntegrationsByUserId.filter(
        (integration) => integration.userId === viewerId
      )
      const aMonthAgo = new Date(Date.now() - ms('30d'))

      // all of the user's own integrations are active
      if (
        userIntegrationsForTeam.length >= 3 &&
        userIntegrationsForTeam[2].lastUsedAt >= aMonthAgo
      ) {
        return userIntegrationsForTeam
      }

      const integrationSet = new Set()
      teamIntegrationsByUserId.forEach(({id}) => integrationSet.add(id))

      // the user uses all of the ones on the team
      if (userIntegrationsForTeam.length === integrationSet.size) {
        return userIntegrationsForTeam
      }

      // we need to see which team integrations the user has access to
      const [atlassianAuths, githubAuthForTeam] = await Promise.all([
        dataLoader.get('atlassianAuthByUserId').load(viewerId),
        r
          .table('Provider')
          .getAll(teamId, {index: 'teamId'})
          .filter({
            userId: viewerId,
            service: 'GitHubIntegration',
            isActive: true
          })
          .nth(0)
          .default(null)
      ])

      const permLookup = {
        atlassian: !!atlassianAuths.find((auth) => auth.teamId === teamId),
        [GITHUB]: !!githubAuthForTeam
      }

      const recentUserIntegrations = userIntegrationsForTeam.filter(
        (integration) => integration.lastUsedAt >= aMonthAgo
      )
      const teamIntegrationsWithUserPerms = teamIntegrationsByUserId.filter((integration) => {
        return integration.userId !== viewerId && permLookup[integration.service]
      })
      const result = createSuggestedIntegrations([
        ...recentUserIntegrations,
        ...teamIntegrationsWithUserPerms
      ])
      if (result.length === 0) {
        // return fetchAllIntegrations(dataLoader)
      }
      return result
    }
  }
}
