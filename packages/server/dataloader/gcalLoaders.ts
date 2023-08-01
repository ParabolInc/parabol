import DataLoader from 'dataloader'
import GCalOAuth2Manager from '../integrations/gcal/GCalOAuth2Manager2'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import sendToSentry from '../utils/sendToSentry'
import RootDataLoader from './RootDataLoader'

export const freshGcalAuth = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; userId: string},
    IGetTeamMemberIntegrationAuthQueryResult | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const gcalAuth = await parent.get('teamMemberIntegrationAuths').load({
            service: 'gcal',
            teamId,
            userId
          })
          if (!gcalAuth) return null
          const {expiresAt} = gcalAuth
          const now = new Date()
          if (expiresAt && expiresAt < now) {
            const {providerId, refreshToken} = gcalAuth
            if (!refreshToken) {
              sendToSentry(new Error('No refresh token in gcalAuth'), {userId})
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider
            const manager = new GCalOAuth2Manager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)
            if (oauthRes instanceof Error) return null
            const {accessToken, expiresIn} = oauthRes
            const bufferBeforeExpires = 30
            const millisecondsInSeconds = 1000
            const expiresAtTimestamp =
              new Date().getTime() + (expiresIn - bufferBeforeExpires) * millisecondsInSeconds
            const expiresAt = new Date(expiresAtTimestamp)
            const newGcalAuth = {
              ...gcalAuth,
              accessToken,
              refreshToken: refreshToken,
              expiresAt
            }
            upsertTeamMemberIntegrationAuth(newGcalAuth)
            return newGcalAuth
          }
          return gcalAuth as IGetTeamMemberIntegrationAuthQueryResult
        })
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
  )
}
