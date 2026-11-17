import type OpenAI from 'openai'
import {AI_MODEL} from '../utils/aiModel'
import {REPORT_ANSWER_JSON_SCHEMA} from './reportAnswerJsonSchema'
import type {CompleteReportAsk} from './requestReportSpec'

const TIMEOUT_MS = 30_000

const completeReportAskWithOpenAI =
  (openAI: OpenAI): CompleteReportAsk =>
  async (messages) => {
    const response = await openAI.chat.completions.create(
      {
        model: AI_MODEL,
        reasoning_effort: 'low',
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {name: 'report_answer', strict: true, schema: REPORT_ANSWER_JSON_SCHEMA}
        }
      },
      {timeout: TIMEOUT_MS}
    )
    return {
      content: response.choices[0]?.message?.content ?? null,
      tokenCost: response.usage?.total_tokens ?? 10_000
    }
  }

export default completeReportAskWithOpenAI
