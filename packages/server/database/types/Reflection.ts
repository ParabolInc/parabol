import {sql} from 'kysely'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import generateUID from '../../generateUID'
import GoogleAnalyzedEntity from './GoogleAnalyzedEntity'
import Reactji from './Reactji'

export const toGoogleAnalyzedEntityPG = (entities: GoogleAnalyzedEntity[]) =>
  sql<
    string[]
  >`(select coalesce(array_agg((name, salience, lemma)::"GoogleAnalyzedEntity"), '{}') from json_populate_recordset(null::"GoogleAnalyzedEntity", ${JSON.stringify(entities)}))`

export interface ReflectionInput {
  id?: string
  createdAt?: Date
  creatorId: string
  content: string
  plaintextContent?: string // the plaintext version of content
  entities: GoogleAnalyzedEntity[]
  sentimentScore?: number
  meetingId: string
  reactjis?: Reactji[]
  reflectionGroupId?: string
  promptId: string
  sortOrder?: number
  updatedAt?: Date
}

export default class Reflection {
  id: string
  createdAt: Date
  // userId of the creator
  creatorId: string | null
  content: string
  plaintextContent: string
  entities: GoogleAnalyzedEntity[]
  sentimentScore?: number
  isActive: boolean
  meetingId: string
  reactjis: Reactji[]
  reflectionGroupId: string
  promptId: string
  sortOrder: number
  updatedAt: Date
  constructor(input: ReflectionInput) {
    const {
      content,
      plaintextContent,
      createdAt,
      creatorId,
      entities,
      sentimentScore,
      id,
      meetingId,
      reactjis,
      reflectionGroupId,
      promptId,
      sortOrder,
      updatedAt
    } = input
    const now = new Date()
    this.id = id || generateUID()
    this.createdAt = createdAt || now
    this.creatorId = creatorId
    this.content = content
    this.plaintextContent = plaintextContent || extractTextFromDraftString(content)
    this.entities = entities
    this.sentimentScore = sentimentScore
    this.isActive = true
    this.meetingId = meetingId
    this.reactjis = reactjis || []
    this.reflectionGroupId = reflectionGroupId || generateUID()
    this.promptId = promptId
    this.sortOrder = sortOrder || 0
    this.updatedAt = updatedAt || now
  }
  toPG() {
    return {
      ...this,
      reactjis: this.reactjis.map((r) => `(${r.id},${r.userId})`),
      // this is complex because we have to account for escape chars. it's safest to pass in a JSON object & let PG do the conversion for us
      entities: toGoogleAnalyzedEntityPG(this.entities)
    }
  }
}
