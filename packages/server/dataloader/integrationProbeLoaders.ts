import DataLoader from 'dataloader'
import type {Selectable} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {IntegrationAccountProbe, Probesubjecttypeenum} from '../postgres/types/pg'
import type RootDataLoader from './RootDataLoader'

export type IntegrationAccountProbeRow = Selectable<IntegrationAccountProbe>

interface ProbeSubjectKey {
  subject: string
  subjectType: Probesubjecttypeenum
}

/**
 * Completed lookups for one subject — an email or a domain. Domain rows are shared by everyone at
 * that company, which is why the loader is keyed by subject rather than by user.
 */
export const integrationAccountProbesBySubject = (parent: RootDataLoader) => {
  return new DataLoader<ProbeSubjectKey, IntegrationAccountProbeRow[], string>(
    async (keys) => {
      const pg = getKysely()
      const rows = await pg
        .selectFrom('IntegrationAccountProbe')
        .selectAll()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('subject', 'subjectType'),
            'in',
            keys.map((key) => tuple(key.subject, key.subjectType))
          )
        )
        .where('status', '=', 'done')
        .execute()
      return keys.map((key) =>
        rows.filter(
          ({subject, subjectType}) =>
            // citext makes the column comparison case-insensitive, so match it here too
            subject.toLowerCase() === key.subject.toLowerCase() && subjectType === key.subjectType
        )
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({subject, subjectType}) => `${subjectType}:${subject.toLowerCase()}`
    }
  )
}
