import stringify from 'fast-json-stable-stringify'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {redisStoreAndNetwork} from '../../utils/redisStoreAndNetwork'
import clickUpRequest, {type ClickUpReadInit, type ClickUpRequestAuth} from './clickUpRequest'

export type ClickUpCacheAuth = ClickUpRequestAuth &
  Pick<TeamMemberIntegrationAuth, 'teamId' | 'userId' | 'providerUserId'>

const readClickUpCached = <TRaw, T extends object>(
  auth: ClickUpCacheAuth,
  path: string,
  init: ClickUpReadInit,
  maxAge: number,
  select: (raw: TRaw) => T | Error
) =>
  redisStoreAndNetwork(
    `clickup:${auth.teamId}:${auth.userId}:${auth.providerUserId ?? ''}:${path}:${stringify(init.query ?? {})}`,
    async () => {
      const raw = await clickUpRequest<TRaw>(auth, path, init)
      return raw instanceof Error ? raw : select(raw)
    },
    (value: T) => value,
    {maxAge, ttl: maxAge}
  )

export default readClickUpCached
