export type Grade = 1 | 2 | 3
export type Grades = Map<number, Grade>

export interface QueryResult {
  query: string
  category: string
  answerable: boolean
  nDCG10: number
  recall5: number
  recall20: number
  junkAt5: number
  reciprocalRank: number
  resultIds: number[]
  resultKeys: string[]
  latencyMs: number
  error?: string
}

export interface Metrics {
  queries: number
  nDCG10: number
  recall5: number
  recall20: number
  mrr: number
  zeroResultRate: number
  junkAt5: number
  noAnswerResults: number
  p50Ms: number
  p90Ms: number
}

const gainOf = (grade: number) => 2 ** grade - 1

const discountedGain = (grade: number, rank: number) => gainOf(grade) / Math.log2(rank + 1)

const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

const percentile = (sortedValues: number[], p: number) =>
  sortedValues[Math.ceil(p * sortedValues.length) - 1] ?? 0

export const ndcgAt = (k: number, resultIds: number[], grades: Grades) => {
  const dcg = resultIds
    .slice(0, k)
    .reduce((sum, id, idx) => sum + discountedGain(grades.get(id) ?? 0, idx + 1), 0)
  const idealDcg = [...grades.values()]
    .sort((a, b) => b - a)
    .slice(0, k)
    .reduce((sum, grade, idx) => sum + discountedGain(grade, idx + 1), 0)
  return idealDcg === 0 ? 0 : dcg / idealDcg
}

const isRelevant = (id: number, grades: Grades, minGrade: number) =>
  (grades.get(id) ?? 0) >= minGrade

export const recallAt = (k: number, resultIds: number[], grades: Grades, minGrade = 2) => {
  const relevantCount = [...grades.values()].filter((grade) => grade >= minGrade).length
  if (relevantCount === 0) return 0
  const foundCount = resultIds.slice(0, k).filter((id) => isRelevant(id, grades, minGrade)).length
  return foundCount / relevantCount
}

export const reciprocalRank = (resultIds: number[], grades: Grades, minGrade = 2) => {
  const firstRelevantIdx = resultIds.findIndex((id) => isRelevant(id, grades, minGrade))
  return firstRelevantIdx === -1 ? 0 : 1 / (firstRelevantIdx + 1)
}

export const junkAt = (k: number, resultIds: number[], grades: Grades) => {
  const shown = resultIds.slice(0, k)
  if (shown.length === 0) return 0
  return shown.filter((id) => !grades.has(id)).length / shown.length
}

export const summarize = (perQuery: QueryResult[]): Metrics => {
  const answerable = perQuery.filter((result) => result.answerable)
  const unanswerable = perQuery.filter((result) => !result.answerable)
  const latencies = perQuery.map((result) => result.latencyMs).sort((a, b) => a - b)
  return {
    queries: answerable.length,
    nDCG10: mean(answerable.map((result) => result.nDCG10)),
    recall5: mean(answerable.map((result) => result.recall5)),
    recall20: mean(answerable.map((result) => result.recall20)),
    mrr: mean(answerable.map((result) => result.reciprocalRank)),
    zeroResultRate: mean(answerable.map((result) => (result.resultIds.length === 0 ? 1 : 0))),
    junkAt5: mean(answerable.map((result) => result.junkAt5)),
    noAnswerResults: mean(unanswerable.map((result) => result.resultIds.length)),
    p50Ms: percentile(latencies, 0.5),
    p90Ms: percentile(latencies, 0.9)
  }
}
