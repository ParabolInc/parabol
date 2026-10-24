import dayjs from 'dayjs'
import {REPORT_VIEW_LABELS} from './reportSpecLabels'
import {parseReportSpecJSON} from './reportSpecParam'

export interface ReportAskRecent {
  id: string
  question: string | null | undefined
  title: string
  spec: string | null | undefined
  lastUsedAt: string
}

export interface ReportAskPopular {
  id: string
  key: string
  subject: 'people' | 'impact' | 'teamHealth' | 'teams'
  question: string
  title: string
  spec: string
}

export interface ReportAskTextPart {
  text: string
  isMatch: boolean
}

interface ListedOption {
  id: string
  section: string
  group: string | null
  parts: ReportAskTextPart[]
  detail: string
}

export type ReportAskOption =
  | {kind: 'ask'; id: string; question: string}
  | (ListedOption & {kind: 'recent'; recent: ReportAskRecent})
  | (ListedOption & {kind: 'popular'; popular: ReportAskPopular})

const SUBJECT_LABELS: Record<ReportAskPopular['subject'], string> = {
  people: 'People',
  impact: 'Impact',
  teamHealth: 'Team Health',
  teams: 'Teams'
}
const RECENT_COUNT = 3

// short words like "is" or "of" would match nearly every question
const toWords = (query: string) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)

const escapeRegExp = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const highlightWords = (text: string, words: string[]): ReportAskTextPart[] => {
  if (words.length === 0) return [{text, isMatch: false}]
  const pattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi')
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({text: part, isMatch: words.includes(part.toLowerCase())}))
}

const countMatches = (text: string, words: string[]) => {
  const lowerText = text.toLowerCase()
  return words.filter((word) => lowerText.includes(word)).length
}

const matchesAnyWord = (text: string, words: string[]) =>
  words.length === 0 || countMatches(text, words) > 0

const viewOf = (specJSON: string | null | undefined) => {
  const spec = specJSON ? parseReportSpecJSON(specJSON) : null
  return spec ? REPORT_VIEW_LABELS[spec.showAs] : 'Couldn’t build'
}

const formatLastUsed = (lastUsedAt: string) => {
  const date = dayjs(lastUsedAt)
  const today = dayjs().startOf('day')
  if (!date.isBefore(today)) return 'Today'
  if (date.isAfter(today.subtract(6, 'day'))) return date.format('dddd')
  return date.format('MMM D')
}

interface Options {
  query: string
  recents: readonly ReportAskRecent[]
  populars: readonly ReportAskPopular[]
  // the popular questions nearest to a question AI couldn't answer
  suggestions: readonly ReportAskPopular[] | null
  canAsk: boolean
}

// Questions match on any word. Asking AI comes first, then recent questions, then popular ones: those that
// match the most words first, or by subject before anything is typed
export const toReportAskOptions = ({query, recents, populars, suggestions, canAsk}: Options) => {
  const words = toWords(query)
  const question = query.trim()
  const options: ReportAskOption[] = []
  if (canAsk && question && !suggestions) options.push({kind: 'ask', id: 'ask', question})
  const toPopularOption = (
    popular: ReportAskPopular,
    section: string,
    group: string | null,
    matchWords = words
  ) => ({
    kind: 'popular' as const,
    id: `popular:${popular.key}`,
    section,
    group,
    parts: highlightWords(popular.question, matchWords),
    detail: `${popular.title} · ${viewOf(popular.spec)}`,
    popular
  })
  if (suggestions) {
    suggestions.forEach((popular) =>
      options.push(toPopularOption(popular, 'Nearest popular questions', null, []))
    )
    return options
  }
  recents
    .filter((recent) => matchesAnyWord(`${recent.question ?? ''} ${recent.title}`, words))
    .slice(0, RECENT_COUNT)
    .forEach((recent) =>
      options.push({
        kind: 'recent',
        id: `recent:${recent.id}`,
        section: 'Recent',
        group: null,
        parts: highlightWords(recent.question || recent.title, words),
        detail: `${viewOf(recent.spec)} · ${formatLastUsed(recent.lastUsedAt)}`,
        recent
      })
    )
  populars
    .map((popular) => ({
      popular,
      matchCount: countMatches(`${popular.question} ${popular.title}`, words)
    }))
    .filter(({matchCount}) => words.length === 0 || matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .forEach(({popular}) =>
      options.push(
        toPopularOption(
          popular,
          'Popular questions',
          words.length > 0 ? null : SUBJECT_LABELS[popular.subject]
        )
      )
    )
  return options
}
