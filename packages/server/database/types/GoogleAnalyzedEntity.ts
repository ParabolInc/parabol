import {sql} from 'kysely'

interface Input {
  lemma?: string
  name: string
  salience: number
}

export default class GoogleAnalyzedEntity {
  lemma?: string
  name: string
  salience: number
  constructor(input: Input) {
    const {lemma, name, salience} = input
    this.lemma = lemma || undefined
    this.name = name
    this.salience = salience
  }
}

export const toGoogleAnalyzedEntityPG = (entities: GoogleAnalyzedEntity[]) =>
  sql<
    string[]
  >`(select coalesce(array_agg((name, salience, lemma)::"GoogleAnalyzedEntity"), '{}') from json_populate_recordset(null::"GoogleAnalyzedEntity", ${JSON.stringify(entities)}))`
