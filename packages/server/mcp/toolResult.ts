import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js'
import type {FormattedExecutionResult} from 'graphql'
import {z} from 'zod'

export const MAX_RESULT_LENGTH = 100_000
const TRUNCATION_NOTICE = '\n…truncated: ask for fewer fields or use pagination arguments'

const retryAfterSchema = z.object({
  http: z.object({headers: z.object({'Retry-After': z.coerce.number().int().nonnegative()})})
})

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

const formatErrors = (
  errors: NonNullable<FormattedExecutionResult['errors']>,
  errorDetails?: Record<string, unknown>
) =>
  errors.map(({message, path, extensions}) => {
    const retryAfter = retryAfterSchema.safeParse(extensions)
    return {
      message,
      code: extensions?.code,
      ...(path && {path}),
      ...(retryAfter.success && {retryAfter: retryAfter.data.http.headers['Retry-After']}),
      ...errorDetails
    }
  })

const toolResult = (
  {data, errors}: FormattedExecutionResult,
  errorDetails?: Record<string, unknown>
): CallToolResult => {
  if (errors?.length) {
    const formatted = formatErrors(errors, errorDetails)
    return textResult(JSON.stringify(data ? {errors: formatted, data} : formatted), true)
  }
  return textResult(JSON.stringify(data ?? null))
}

export default toolResult
