import type {RemoveIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'

export type RemoveIntegrationSearchQuerySuccessSource = {
  teamId: string
  userId: string
}

const RemoveIntegrationSearchQuerySuccess: RemoveIntegrationSearchQuerySuccessResolvers = {
  jiraServerIntegration: (source) => source,
  atlassianIntegration: ({teamId, userId}, _args, {dataLoader}) =>
    dataLoader.get('freshAtlassianAuth').load({teamId, userId}),
  githubIntegration: async ({teamId, userId}, _args, {dataLoader}) =>
    (await dataLoader.get('githubAuth').load({teamId, userId})) ?? null
}

export default RemoveIntegrationSearchQuerySuccess
