import {Selectable} from 'kysely'
import QuickLRU from 'quick-lru'

import getRethink, {RethinkSchema} from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'

const CACHE_MAX_ITEMS = 8192

const pg = getKysely()

interface CacheKeyType {
  type: string
  id: string
}

const objectCache = new QuickLRU<CacheKeyType, any>({maxSize: CACHE_MAX_ITEMS})

const cacheLookup = async (key: CacheKeyType, missFn: (id: string) => Promise<any>) => {
  if (objectCache.has(key)) return objectCache.get(key) ?? null

  const value = await missFn(key.id)
  objectCache.set(key, value)
  return value
}

export async function getOrgIdByTeamId(teamId: string): Promise<string | null> {
  return cacheLookup(
    {
      type: 'orgIdByTeamId',
      id: teamId
    },
    (teamId) => {
      const result = pg
        .selectFrom('Team')
        .select('orgId')
        .where('id', '=', teamId)
        .executeTakeFirst() ?? {orgId: null}
      return result['orgId']
    }
  )
}

export async function getMeetingTemplateById(
  id: string
): Promise<Selectable<DB['MeetingTemplate']> | null> {
  return cacheLookup(
    {
      type: 'meetingTemplateById',
      id
    },
    (id) =>
      pg.selectFrom('MeetingTemplate').selectAll().where('id', '=', id).executeTakeFirst() ?? null
  )
}

export async function getNewMeetingById(
  id: string
): Promise<RethinkSchema['NewMeeting']['type'] | null> {
  const r = await getRethink()
  return cacheLookup(
    {
      type: 'newMeetingById',
      id
    },
    (id) => r.table('NewMeeting').get(id).run()
  )
}

export async function getReflectPromptById(
  id: string
): Promise<RethinkSchema['ReflectPrompt']['type'] | null> {
  const r = await getRethink()
  return cacheLookup(
    {
      type: 'reflectPromptById',
      id
    },
    (id) => r.table('ReflectPrompt').get(id).run()
  )
}

export async function getUserById(id: string): Promise<Selectable<DB['User']> | null> {
  return cacheLookup(
    {
      type: 'userById',
      id
    },
    (id) => pg.selectFrom('User').selectAll().where('id', '=', id).executeTakeFirst() ?? null
  )
}
