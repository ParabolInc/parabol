import ms from 'ms'
import {setupGdriveFileWatcher} from '../../../integrations/gdrive/setupGdriveFileWatcher'
import type {GdriveIntegrationResolvers} from '../resolverTypes'

export type GdriveIntegrationSource = {
  teamId: string
  userId: string
}

const GdriveIntegration: GdriveIntegrationResolvers = {
  auth: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshGdriveAuth').load({teamId, userId})
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gdrive', orgIds: [], teamIds: []})
    return globalProvider ?? null
  },

  isActive: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader.get('freshGdriveAuth').load({teamId, userId})
    return !!auth?.isActive
  },

  watchExpiresAt: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader.get('freshGdriveAuth').load({teamId, userId})
    if (!auth) return null
    const {watchExpiresAt} = auth
    if (!watchExpiresAt || watchExpiresAt.getTime() - Date.now() < ms('1d')) {
      try {
        const newExpiresAt = await setupGdriveFileWatcher(auth, userId, teamId)
        return newExpiresAt
      } catch {
        return null
      }
    }
    return watchExpiresAt ?? null
  }
}

export default GdriveIntegration
