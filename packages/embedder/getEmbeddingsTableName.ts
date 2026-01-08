import type {DB} from '../server/postgres/types/pg'

export type EmbeddingsTableName = `Embeddings_${string}`
export type EmbeddingsTable = Extract<keyof DB, EmbeddingsTableName>
export const getEmbeddingsTableName = (suffix: string) => {
  return `Embeddings_${suffix}` as EmbeddingsTable
}
