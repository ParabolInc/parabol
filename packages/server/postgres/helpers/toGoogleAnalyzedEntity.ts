import {sql} from 'kysely'
import GoogleAnalyzedEntity from '../../database/types/GoogleAnalyzedEntity'
export const toGoogleAnalyzedEntity = (entities: GoogleAnalyzedEntity[]) =>
  sql<
    string[]
  >`(select coalesce(array_agg((name, salience, lemma)::"GoogleAnalyzedEntity"), '{}') from json_populate_recordset(null::"GoogleAnalyzedEntity", ${JSON.stringify(entities)}))`
