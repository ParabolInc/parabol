import {readReportSpec} from '../../client/shared/reports/parseReportSpec'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import {validateReportSpec} from '../../client/shared/reports/validateReportSpec'
import buildReportAskPrompt from './buildReportAskPrompt'

export interface ReportAskMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type CompleteReportAsk = (
  messages: ReportAskMessage[]
) => Promise<{content: string | null; tokenCost: number}>

interface Options {
  question: string
  teams: {id: string; name: string}[]
  today: string
  timeZone: string
  complete: CompleteReportAsk
}

export type ReportAskAnswer =
  | {spec: ReportSpec; title: string; aiSpec: unknown; tokenCost: number}
  | {spec: null; reason: string; aiSpec: unknown; tokenCost: number}

const ATTEMPTS = 2

const readAnswer = (content: string | null) => {
  try {
    const answer: unknown = JSON.parse(content ?? '')
    return typeof answer === 'object' && answer !== null ? answer : null
  } catch {
    return null
  }
}

// AI only fills in the parameters. A spec that breaks a rule goes back once with the rule it broke
const requestReportSpec = async ({question, teams, today, timeZone, complete}: Options) => {
  const messages: ReportAskMessage[] = [
    {role: 'system', content: buildReportAskPrompt({teams, today, timeZone})},
    {role: 'user', content: question}
  ]
  let tokenCost = 0
  let aiSpec: unknown = null
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const completion = await complete(messages)
    tokenCost += completion.tokenCost
    const answer = readAnswer(completion.content)
    if (answer && 'canAnswer' in answer && answer.canAnswer === false) {
      const reason = 'reason' in answer && typeof answer.reason === 'string' ? answer.reason : null
      return {
        spec: null,
        reason: reason || 'Parabol doesn’t have the data for that report',
        aiSpec,
        tokenCost
      } satisfies ReportAskAnswer
    }
    aiSpec = answer && 'spec' in answer ? answer.spec : null
    const spec = readReportSpec(aiSpec)
    const problem = spec ? validateReportSpec(spec) : 'The spec isn’t in the shape of the schema'
    if (spec && !problem) {
      const title =
        answer && 'title' in answer && typeof answer.title === 'string' ? answer.title : ''
      return {spec, title: title.trim() || question, aiSpec, tokenCost} satisfies ReportAskAnswer
    }
    messages.push(
      {role: 'assistant', content: completion.content ?? ''},
      {
        role: 'user',
        content: `Parabol can't run that spec: ${problem}. Answer again with a spec that follows every rule, or set canAnswer to false.`
      }
    )
  }
  return {
    spec: null,
    reason: 'AI couldn’t make a report Parabol can run for that question',
    aiSpec,
    tokenCost
  } satisfies ReportAskAnswer
}

export default requestReportSpec
