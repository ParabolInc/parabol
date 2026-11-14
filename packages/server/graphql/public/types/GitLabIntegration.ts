import GitLabServerManager, {
  GitLabRateLimitError
} from '../../../integrations/gitlab/GitLabServerManager'
import type {GetProjectIssuesQuery, IssuableState, IssueSort} from '../../../types/gitlabTypes'
import logError from '../../../utils/logError'
import type {GitLabIntegrationResolvers} from '../resolverTypes'

export type GitLabIntegrationSource = {
  teamId: string
  userId: string
}

type ProjectIssuesRes = NonNullable<NonNullable<GetProjectIssuesQuery['project']>['issues']>
type ProjectIssueEdgeNullable = Pick<
  NonNullable<NonNullable<ProjectIssuesRes['edges']>[number]>,
  'cursor' | 'node'
>
type ProjectIssueNode = NonNullable<ProjectIssueEdgeNullable['node']>
type ProjectIssueEdge = ProjectIssueEdgeNullable & {node: ProjectIssueNode}

type CursorDetails = {
  fullPath: string
  cursor: string
}

// GitLab lets a user search issues 30 times a minute by default and counts every project searched,
// so a search asks each group once and only projects outside a group one by one
const toSearchSources = (projects: {fullPath: string; group?: {fullPath: string} | null}[]) => {
  const groupPaths = [...new Set(projects.flatMap(({group}) => (group ? [group.fullPath] : [])))]
  const isSubgroup = (path: string) => groupPaths.some((other) => path.startsWith(`${other}/`))
  const groups = groupPaths.filter((path) => !isSubgroup(path))
  const personalProjects = projects.filter(({group}) => !group)
  return [
    ...groups.map((fullPath) => ({fullPath, isGroup: true})),
    ...personalProjects.map(({fullPath}) => ({fullPath, isGroup: false}))
  ]
}

const GitLabIntegration: GitLabIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshAuth').load({service: 'gitlab', teamId, userId})
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gitlab', orgIds: [], teamIds: []})
    return globalProvider!
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const sharedProviders = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gitlab', orgIds: [orgId], teamIds: [teamId]})
    return sharedProviders.filter(({scope}) => scope !== 'global')
  },

  projectsIssues: async ({teamId, userId}, args, context, info) => {
    const {projectsIds, searchQuery} = args
    const after = args?.after ?? ''
    const {dataLoader} = context
    const emptyConnection = {
      edges: [],
      pageInfo: {hasNextPage: false, hasPreviousPage: false}
    }
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'gitlab', teamId, userId})
    if (!auth?.accessToken) return emptyConnection
    const {providerId} = auth
    const provider = await dataLoader.get('integrationProviders').load(providerId)
    if (!provider?.serverBaseUrl) return emptyConnection
    const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
    const [projectsData, projectsErr] = await manager.getProjects({
      ids: projectsIds as string[],
      first: 50 // if no project filters have been selected, get the 50 most recently used projects
    })
    if (projectsErr) {
      logError(new Error('Unable to get GitLab projects in projectsIssues query'), {userId})
      return emptyConnection
    }
    const projects = (projectsData.projects?.edges ?? []).flatMap((edge) =>
      edge?.node ? [edge.node] : []
    )
    const sources =
      searchQuery && !projectsIds?.length
        ? toSearchSources(projects)
        : projects.map(({fullPath}) => ({fullPath, isGroup: false}))
    let parsedAfter: CursorDetails[] | null
    try {
      parsedAfter = after.length ? JSON.parse(after) : null
    } catch {
      logError(new Error('Error parsing after'), {userId, tags: {after}})
      return emptyConnection
    }
    const isValidJSON = parsedAfter?.every(
      (cursorsDetails) =>
        typeof cursorsDetails.cursor === 'string' && typeof cursorsDetails.fullPath === 'string'
    )
    if (isValidJSON === false) {
      logError(new Error('after arg has an invalid JSON structure'), {
        userId,
        tags: {after}
      })
      return emptyConnection
    }

    const pagedSources = parsedAfter
      ? sources.filter(({fullPath}) => parsedAfter.some((cursor) => cursor.fullPath === fullPath))
      : sources
    const projectsIssuesPromises = pagedSources.map(async ({fullPath, isGroup}) => {
      const issuesArgs = {
        ...args,
        fullPath,
        after: parsedAfter?.find((cursor) => cursor.fullPath === fullPath)?.cursor ?? '',
        sort: args.sort as IssueSort,
        state: args.state as IssuableState
      }
      if (isGroup) {
        const [groupIssuesData, err] = await manager.getGroupIssues(issuesArgs)
        return [groupIssuesData?.group, err] as const
      }
      const [projectIssuesData, err] = await manager.getProjectIssues(issuesArgs)
      return [projectIssuesData?.project, err] as const
    })
    const projectsIssues = [] as ProjectIssueEdge[]
    const errors = [] as Error[]
    let hasNextPage = false
    const endCursor = [] as CursorDetails[]
    const projectsIssuesResponses = await Promise.all(projectsIssuesPromises)
    for (const [issuesParent, err] of projectsIssuesResponses) {
      if (err) {
        errors.push(err)
        if (!(err instanceof GitLabRateLimitError)) logError(err, {userId})
        continue
      }
      if (!issuesParent?.issues) continue
      const {fullPath, issues} = issuesParent
      const {edges, pageInfo} = issues
      if (pageInfo.hasNextPage) {
        hasNextPage = true
        const currentCursorDetails = endCursor.find(
          (cursorDetails) => cursorDetails.fullPath === fullPath
        )
        const newCursor = pageInfo.endCursor ?? ''
        if (currentCursorDetails) currentCursorDetails.cursor = newCursor
        else endCursor.push({fullPath, cursor: newCursor})
      }
      edges?.forEach((edge) => {
        if (!edge?.node) return
        const {node, cursor} = edge
        projectsIssues.push({cursor, node})
      })
    }

    const firstEdge = projectsIssues[0]
    const stringifiedEndCursor = JSON.stringify(endCursor)
    return {
      error: errors[0] && {message: errors[0].message},
      edges: projectsIssues as any,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: stringifiedEndCursor,
        hasNextPage,
        hasPreviousPage: false
      }
    }
  }
}

export default GitLabIntegration
