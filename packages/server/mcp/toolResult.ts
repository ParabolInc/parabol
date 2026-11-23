import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js'
import type {ExecutionResult} from 'graphql'

const MAX_RESULT_LENGTH = 100_000
const TRUNCATION_NOTICE = '\n…truncated: ask for fewer fields or use pagination arguments'

export const textResult = (text: string, isError?: boolean): CallToolResult => ({
  ...(isError && {isError}),
  content: [
    {
      type: 'text',
      text:
        text.length > MAX_RESULT_LENGTH
          ? text.slice(0, MAX_RESULT_LENGTH) + TRUNCATION_NOTICE
          : text
    }
  ]
})

const toolResult = ({data, errors}: ExecutionResult): CallToolResult => {
  if (errors?.length) {
    return textResult(
      JSON.stringify(errors.map(({message, extensions}) => ({message, code: extensions?.code}))),
      true
    )
  }
  return textResult(JSON.stringify(data ?? null))
}

export default toolResult
