import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import promiseAllPartial from 'parabol-client/utils/promiseAllPartial'
import getRethink from '../database/rethinkDriver'
import Task from '../database/types/Task'
import AtlassianServerManager from '../utils/AtlassianServerManager'
import RethinkDataLoader from './RethinkDataLoader'

type AccessTokenKey = {teamId: string; userId: string}
interface JiraRemoteProjectKey {
  accessToken: string
  cloudId: string
  atlassianProjectId: string
}

interface UserTasksKey {
  userId: string
  teamIds: string[]
}

// export type LoaderMakerCustom<K, V, C = K> = (parent: RethinkDataLoader) => DataLoader<K, V, C>

export const userTasks = (parent: RethinkDataLoader) => {
  return new DataLoader<UserTasksKey, Task[], string>(
    async (keys) => {
      const r = await getRethink()
      const userIds = keys.map(({userId}) => userId)
      const teamIds = Array.from(new Set(keys.flatMap(({teamIds}) => teamIds)))
      const taskLoader = parent.get('tasks')
      const allUsersTasks = (await r
        .table('Task')
        .getAll(r.args(userIds), {index: 'userId'})
        .filter((task) => r(teamIds).contains(task('teamId')))
        .filter((task) =>
          task('tags')
            .contains('archived')
            .not()
        )
        .run()) as Task[]
      allUsersTasks.forEach((task) => {
        taskLoader.clear(task.id).prime(task.id, task)
      })
      return keys.map((key) =>
        allUsersTasks.filter(
          (task) => task.userId === key.userId && key.teamIds.includes(task.teamId)
        )
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamIds.sort().join(':')}`
    }
  )
}

export const freshAtlassianAccessToken = (parent: RethinkDataLoader) => {
  const userAuthLoader = parent.get('atlassianAuthByUserId')
  return new DataLoader<AccessTokenKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await userAuthLoader.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AtlassianServerManager.refresh(refreshToken)
          const {accessToken} = manager
          const r = await getRethink()
          await r
            .table('AtlassianAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .update({accessToken, updatedAt: now})
            .run()
          return accessToken
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const jiraRemoteProject = (parent: RethinkDataLoader) => {
  return new DataLoader<JiraRemoteProjectKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, cloudId, atlassianProjectId}) => {
          const manager = new AtlassianServerManager(accessToken)
          return manager.getProject(cloudId, atlassianProjectId)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.atlassianProjectId}:${key.cloudId}`
    }
  )
}
