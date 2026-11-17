import {type ChildProcess, spawn} from 'child_process'
import type TaskLog from './TaskLog.mts'

const KILL_AFTER_MS = 1500

type ChildTaskOptions = {
  command: string
  args?: string[]
  env?: Record<string, string>
  cwd: string
  log: TaskLog
  onExit?: (code: number | null) => void
  killAfterMs?: number
}

// A child process that can be restarted. Restarts never overlap: the old process is gone before the new one starts
export default class ChildTask {
  command: string
  args: string[]
  env: Record<string, string>
  cwd: string
  log: TaskLog
  onExit: ChildTaskOptions['onExit']
  killAfterMs: number
  child: ChildProcess | null = null
  exited: Promise<void> = Promise.resolve()
  queue: Promise<void> = Promise.resolve()

  constructor({
    command,
    args = [],
    env = {},
    cwd,
    log,
    onExit,
    killAfterMs = KILL_AFTER_MS
  }: ChildTaskOptions) {
    this.command = command
    this.args = args
    this.env = env
    this.cwd = cwd
    this.log = log
    this.onExit = onExit
    this.killAfterMs = killAfterMs
  }

  get pid() {
    return this.child?.pid
  }

  start() {
    return this.enqueue(() => this.spawnChild())
  }

  restart() {
    return this.enqueue(async () => {
      await this.killChild()
      this.spawnChild()
    })
  }

  stop() {
    return this.enqueue(() => this.killChild())
  }

  enqueue(step: () => void | Promise<void>) {
    this.queue = this.queue.then(step, step)
    return this.queue
  }

  spawnChild() {
    // detached makes the child the leader of its own process group, so killing the group also takes its descendants
    const child = spawn(this.command, this.args, {
      cwd: this.cwd,
      env: {...process.env, ...this.env},
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    this.child = child
    child.stdout.on('data', (chunk: Buffer) => this.log.write(chunk))
    child.stderr.on('data', (chunk: Buffer) => this.log.write(chunk))
    this.exited = new Promise((resolve) => {
      const onGone = () => {
        if (this.child === child) this.child = null
        resolve()
      }
      // a command that cannot be started never exits, so it counts as gone right away
      child.on('error', (error) => {
        this.log.line(`Could not start: ${error.message}`)
        onGone()
      })
      child.on('exit', (code) => {
        onGone()
        this.onExit?.(code)
      })
    })
  }

  async killChild() {
    const {child, exited} = this
    if (!child) return
    this.signalGroup(child, 'SIGTERM')
    const killTimer = setTimeout(() => this.signalGroup(child, 'SIGKILL'), this.killAfterMs)
    await exited
    clearTimeout(killTimer)
  }

  signalGroup(child: ChildProcess, signal: NodeJS.Signals) {
    if (!child.pid) return
    try {
      process.kill(-child.pid, signal)
    } catch {
      // already gone
    }
  }

  killNow() {
    if (this.child) this.signalGroup(this.child, 'SIGKILL')
  }
}
