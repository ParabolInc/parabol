import type {ToolAnnotations} from '@modelcontextprotocol/sdk/types.js'

export const readAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false
} satisfies ToolAnnotations

export const writeAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: false
} satisfies ToolAnnotations
