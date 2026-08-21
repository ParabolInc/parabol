import type {PersistIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'

export type PersistIntegrationSearchQuerySuccessSource = {
  teamId: string
  userId: string
}

const PersistIntegrationSearchQuerySuccess: PersistIntegrationSearchQuerySuccessResolvers = {
  jiraServerIntegration: (source) => source,
  atlassianIntegration: ({teamId, userId}, _args, {dataLoader}) =>
    dataLoader.get('freshAtlassianAuth').load({teamId, userId}),
  githubIntegration: async ({teamId, userId}, _args, {dataLoader}) =>
    (await dataLoader.get('githubAuth').load({teamId, userId})) ?? null
}

export default PersistIntegrationSearchQuerySuccess
