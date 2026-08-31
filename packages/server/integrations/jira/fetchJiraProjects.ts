import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import type {JiraGQLProject} from '../../dataloader/atlassianLoaders'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'

/** Every Jira Cloud project across the user's sites, plus the first failure. `projects` is partial when `error` is set */
export const fetchJiraProjectsResult = async ({
  dataLoader,
  teamId,
  userId
}: RepoFetchCtx): Promise<{projects: JiraGQLProject[]; error?: Error}> => {
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) return {projects: []}
  const manager = new AtlassianServerManager(auth.accessToken)
  const cloudNameLookup = await manager.getCloudNameLookup()
  if (cloudNameLookup instanceof Error) return {projects: [], error: cloudNameLookup}
  const {projects, error} = await manager.getAllProjects(Object.keys(cloudNameLookup))
  return {
    projects: projects.map((project) => ({
      ...project,
      id: JiraProjectId.join(project.cloudId, project.key),
      userId,
      teamId,
      service: 'jira' as const
    })),
    error
  }
}

/** The repo-list capability: an Error whenever any site or page failed, so a partial list is never cached */
const fetchJiraProjects = async (ctx: RepoFetchCtx): Promise<JiraGQLProject[] | Error> => {
  const {projects, error} = await fetchJiraProjectsResult(ctx)
  return error ?? projects
}

export default fetchJiraProjects
