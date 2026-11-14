import fs from 'fs'
import path from 'path'
import getProjectRoot from '../webpack/utils/getProjectRoot.js'

export const STACK_PATH = path.join(getProjectRoot(), 'dev', 'stack.json')

export type DevStack = {
  pid: number
  url: string
  port: number
  socketPort: number
  database: string | undefined
  isolated: boolean
  ready: boolean
  readyAfterMs: number | null
  startedAt: string
  logs: string
  childPids: number[]
}

// What dev/stack.json says about the stack of this checkout, or null when that stack is not running
const readStack = () => {
  try {
    const stack: DevStack = JSON.parse(fs.readFileSync(STACK_PATH, 'utf8'))
    process.kill(stack.pid, 0)
    return stack
  } catch {
    return null
  }
}

export default readStack
