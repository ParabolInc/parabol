import type {AnyTaskIntegration} from 'parabol-client/shared/types/TaskIntegration'
import logError from '../../utils/logError'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import {isExpectedClickUpFailure} from './clickUpRequest'
import fetchClickUpTask from './fetchClickUpTask'
import type {ClickUpTaskSource} from './mapClickUpTask'

/** Null when the task is gone, the connection is dead, or its workspace is not shared with Parabol */
const loadClickUpIssues = async (
  {dataLoader, teamId, userId}: RepoFetchCtx,
  integrations: readonly AnyTaskIntegration[]
): Promise<(ClickUpTaskSource | null)[]> => {
  const auth = await dataLoader.get('freshAuth').load({service: 'clickup', teamId, userId})
  if (!auth?.accessToken) return integrations.map(() => null)
  return Promise.all(
    integrations.map(async (integration) => {
      if (integration.service !== 'clickup') return null
      const clickUpTask = await fetchClickUpTask(auth, integration.taskId)
      if (!(clickUpTask instanceof Error)) return clickUpTask
      if (!isExpectedClickUpFailure(clickUpTask)) {
        logError(clickUpTask, {userId, tags: {teamId, service: 'clickup'}})
      }
      return null
    })
  )
}

export default loadClickUpIssues
