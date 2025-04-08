import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import sendToSentry from '../../../utils/sendToSentry'
import {DataLoaderWorker} from '../../graphql'
import {fetchLinearProjects} from '../../queries/helpers/fetchLinearTeamsAndProjects'
import {LinearIntegrationResolvers} from '../resolverTypes'

type CursorDetails = {
  fullPath: string
  cursor: string
}

const fetchAuth = async (teamId: string, userId: string, dataLoader: DataLoaderWorker) => {
  return dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'linear', teamId, userId})
}

const LinearIntegration: LinearIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return fetchAuth(teamId, userId, dataLoader)
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'linear', orgIds: [], teamIds: []})
    return globalProvider!
  },

  id: ({teamId, userId}) => `linear:${teamId}:${userId}`,

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'linear', orgIds: [orgId], teamIds: [teamId]})
  },

  projects: async ({teamId, userId}, _args, context, info) => {
    return fetchLinearProjects(teamId, userId, context, info)
  },

  projectsIssues: async ({teamId, userId}, args, context, info) => {
    const {projectsIds} = args
    const after = args?.after ?? ''
    const {dataLoader} = context
    const emptyConnection = {edges: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}}
    const auth = await fetchAuth(teamId, userId, dataLoader)
    if (!auth?.accessToken) return emptyConnection
    const manager = new LinearServerManager(auth, context, info)
    const [projectsData, projectsErr] = await manager.getProjects({
      ids: projectsIds as string[],
      first: 50 // if no project filters have been selected, get the 50 most recently used projects
    })
    if (projectsErr) {
      sendToSentry(new Error('Unable to get Linear projects in projectsIssues query'), {userId})
      return emptyConnection
    }
    const projectsFullPaths = new Set<string>()
    projectsData.projects?.edges?.forEach((edge: any) => {
      if (edge?.node?.fullPath) {
        projectsFullPaths.add(edge?.node?.fullPath)
      }
    })
    let parsedAfter: CursorDetails[] | null
    try {
      parsedAfter = after.length ? JSON.parse(after) : null
    } catch (e) {
      sendToSentry(new Error('Error parsing after'), {userId, tags: {after}})
      return emptyConnection
    }
    const isValidJSON = parsedAfter?.every(
      (cursorsDetails) =>
        typeof cursorsDetails.cursor === 'string' && typeof cursorsDetails.fullPath === 'string'
    )
    if (isValidJSON === false) {
      sendToSentry(new Error('after arg has an invalid JSON structure'), {
        userId,
        tags: {after}
      })
      return emptyConnection
    }

    const projectsIssuesPromises = Array.from(projectsFullPaths).map((fullPath) => {
      const after = parsedAfter?.find((cursor) => cursor.fullPath === fullPath)?.cursor ?? ''
      return manager.getProjectIssues({
        ...args,
        fullPath,
        after,
        sort: args.sort as IssueSort,
        state: args.state as IssuableState
      })
    })
    const projectsIssues = [] as ProjectIssueEdge[]
    const errors = [] as Error[]
    let hasNextPage = false
    const endCursor = [] as CursorDetails[]
    const projectsIssuesResponses = await Promise.all(projectsIssuesPromises)
    for (const res of projectsIssuesResponses) {
      const [projectIssuesData, err] = res
      if (err) {
        errors.push(err)
        sendToSentry(err, {userId})
        continue
      }
      const {project} = projectIssuesData
      if (!project?.issues) continue
      const {fullPath, issues} = project
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
      error: errors[0],
      edges: projectsIssues,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: stringifiedEndCursor,
        hasNextPage,
        hasPreviousPage: false
      }
    }
  }
}

export default LinearIntegration
