import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js'
import {textResult} from './toolResult'

const toolError = (message: string, code: string): CallToolResult =>
  textResult(JSON.stringify([{message, code}]), true)

export default toolError
