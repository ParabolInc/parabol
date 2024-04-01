import type {DB} from '../server/postgres/pg'

export type EmbeddingObjectType = DB['EmbeddingsMetadata']['objectType']

export interface MessageToEmbedder {
  objectTypes: EmbeddingObjectType[]
  startAt?: Date
  endAt?: Date
  meetingId?: string
}
export type EmbedderOptions = Omit<MessageToEmbedder, 'objectTypes'>
