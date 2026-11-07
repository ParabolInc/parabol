import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import type {
  ClickUpApiFolder,
  ClickUpApiList,
  ClickUpApiSpace,
  ClickUpApiWorkspace
} from './ClickUpApiTypes'
import clickUpRequest, {type ClickUpRequestAuth} from './clickUpRequest'
import listClickUpWorkspaces, {ClickUpNoWorkspaceError} from './listClickUpWorkspaces'

export interface ClickUpRepo {
  service: 'clickup'
  id: string
  workspaceId: string
  name: string
}

const MAX_CONCURRENT_SPACES = 4
const UNWRITABLE_PERMISSIONS = new Set<ClickUpApiList['permission_level']>(['read', 'comment'])
const NOT_ARCHIVED = {archived: false}

interface SpaceInWorkspace {
  workspace: ClickUpApiWorkspace
  space: ClickUpApiSpace
}

const allOrFirstError = <T>(results: Array<T | Error>): T[] | Error => {
  const values: T[] = []
  for (const result of results) {
    if (result instanceof Error) return result
    values.push(result)
  }
  return values
}

const listSpaces = async (auth: ClickUpRequestAuth, workspace: ClickUpApiWorkspace) => {
  const res = await clickUpRequest<{spaces: ClickUpApiSpace[]}>(
    auth,
    `/team/${encodeURIComponent(workspace.id)}/space`,
    {query: NOT_ARCHIVED, workspaceId: workspace.id}
  )
  return res instanceof Error ? res : res.spaces.map((space) => ({workspace, space}))
}

const listFolderLists = async (
  auth: ClickUpRequestAuth,
  workspaceId: string,
  folder: ClickUpApiFolder
) => {
  const embedded = folder.lists.filter((list) => typeof list === 'object')
  if (embedded.length === folder.lists.length) return embedded
  const res = await clickUpRequest<{lists: ClickUpApiList[]}>(
    auth,
    `/folder/${encodeURIComponent(folder.id)}/list`,
    {query: NOT_ARCHIVED, workspaceId}
  )
  return res instanceof Error ? res : res.lists
}

const folderPath = (folder: ClickUpApiFolder, foldersById: Map<string, ClickUpApiFolder>) => {
  const names = [folder.name]
  const visited = new Set([folder.id])
  let parent = folder.parent_folder ? foldersById.get(folder.parent_folder) : undefined
  while (parent && !visited.has(parent.id)) {
    names.unshift(parent.name)
    visited.add(parent.id)
    parent = parent.parent_folder ? foldersById.get(parent.parent_folder) : undefined
  }
  return names
}

const walkSpace = async (
  auth: ClickUpRequestAuth,
  {workspace, space}: SpaceInWorkspace,
  namePrefix: string[]
): Promise<ClickUpRepo[] | Error> => {
  const workspaceId = workspace.id
  const spacePath = `/space/${encodeURIComponent(space.id)}`
  const init = {query: NOT_ARCHIVED, workspaceId}
  const [folderRes, folderlessRes] = await Promise.all([
    clickUpRequest<{folders: ClickUpApiFolder[]}>(auth, `${spacePath}/folder`, init),
    clickUpRequest<{lists: ClickUpApiList[]}>(auth, `${spacePath}/list`, init)
  ])
  if (folderRes instanceof Error) return folderRes
  if (folderlessRes instanceof Error) return folderlessRes
  const toRepos = (lists: ClickUpApiList[], path: string[]) =>
    lists
      .filter((list) => !UNWRITABLE_PERMISSIONS.has(list.permission_level))
      .map((list) => ({
        service: 'clickup' as const,
        id: list.id,
        workspaceId,
        name: [...namePrefix, space.name, ...path, list.name].join(' / ')
      }))
  const folders = folderRes.folders.filter((folder) => !folder.hidden)
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]))
  const folderRepos = allOrFirstError(
    await Promise.all(
      folders.map(async (folder) => {
        const lists = await listFolderLists(auth, workspaceId, folder)
        return lists instanceof Error ? lists : toRepos(lists, folderPath(folder, foldersById))
      })
    )
  )
  if (folderRepos instanceof Error) return folderRepos
  return [...folderRepos.flat(), ...toRepos(folderlessRes.lists, [])]
}

const fetchClickUpRepos = async ({
  dataLoader,
  teamId,
  userId
}: GqlIntegrationCtx): Promise<ClickUpRepo[] | Error> => {
  const auth = await dataLoader.get('freshAuth').load({service: 'clickup', teamId, userId})
  if (!auth?.accessToken) return []
  const workspaces = await listClickUpWorkspaces(auth)
  if (workspaces instanceof ClickUpNoWorkspaceError) return []
  if (workspaces instanceof Error) return workspaces
  const spacesByWorkspace = allOrFirstError(
    await Promise.all(workspaces.map((workspace) => listSpaces(auth, workspace)))
  )
  if (spacesByWorkspace instanceof Error) return spacesByWorkspace
  const spaces = spacesByWorkspace.flat()
  const workspacePrefix = ({name}: ClickUpApiWorkspace) => (workspaces.length > 1 ? [name] : [])
  const repos: ClickUpRepo[] = []
  for (let i = 0; i < spaces.length; i += MAX_CONCURRENT_SPACES) {
    const batch = spaces.slice(i, i + MAX_CONCURRENT_SPACES)
    const batchRepos = allOrFirstError(
      await Promise.all(
        batch.map((spaceInWorkspace) =>
          walkSpace(auth, spaceInWorkspace, workspacePrefix(spaceInWorkspace.workspace))
        )
      )
    )
    if (batchRepos instanceof Error) return batchRepos
    repos.push(...batchRepos.flat())
  }
  return repos
}

export default fetchClickUpRepos
