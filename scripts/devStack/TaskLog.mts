import fs from 'fs'
import path from 'path'

const COLORS = [36, 35, 33, 32, 34, 96, 95, 93, 92, 94]
let taskCount = 0

// Every task writes to the terminal with its name as a prefix & to its own file in dev/logs, where every line has a timestamp
export default class TaskLog {
  prefix: string
  filePath: string
  file: fs.WriteStream
  partialLine = ''
  lineListeners: ((line: string) => void)[] = []

  constructor(name: string, logDir: string) {
    const color = COLORS[taskCount++ % COLORS.length]
    const label = name.padEnd(16)
    this.prefix = process.stdout.isTTY ? `\x1b[${color}m${label}\x1b[0m │ ` : `${label} │ `
    this.filePath = path.join(logDir, `${name.replace(/\W+/g, '-').toLowerCase()}.log`)
    this.file = fs.createWriteStream(this.filePath)
  }

  onLine(listener: (line: string) => void) {
    this.lineListeners.push(listener)
  }

  write(chunk: Buffer | string) {
    const lines = (this.partialLine + chunk.toString()).split('\n')
    this.partialLine = lines.pop() ?? ''
    lines.forEach((line) => {
      this.line(line)
    })
  }

  line(line: string) {
    this.file.write(`${new Date().toISOString().slice(11, 23)} ${line}\n`)
    if (line.trim()) process.stdout.write(`${this.prefix}${line}\n`)
    this.lineListeners.forEach((listener) => {
      listener(line)
    })
  }
}
